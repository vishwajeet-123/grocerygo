import { Response } from 'express';
import { Server as SocketIOServer } from 'socket.io';

export interface RealtimeEvent {
  type:
    | 'order_created'
    | 'order_updated'
    | 'inventory_updated'
    | 'delivery_assigned'
    | 'delivery_assignment_offered'
    | 'items_packed_ready_for_pickup'
    | 'delivery_rejected'
    | 'delivery_location_update'
    | 'announcement'
    | 'platform_config_updated';
  payload: any;
  timestamp: string;
}

class RealtimeHub {
  private clients: Set<Response> = new Set();
  private io: SocketIOServer | null = null;

  public attachSocketIO(io: SocketIOServer): void {
    this.io = io;

    io.on('connection', (socket) => {
      // Allow clients to join authorization and order rooms
      socket.on('join_room', (room: string) => {
        socket.join(room);
      });

      socket.on('leave_room', (room: string) => {
        socket.leave(room);
      });

      socket.on('subscribe_store', (storeId: string) => {
        socket.join(`store:${storeId}`);
      });

      socket.on('subscribe_order', (orderId: string) => {
        socket.join(`order:${orderId}`);
      });

      socket.on('subscribe_partner', (partnerId: string) => {
        socket.join(`partner:${partnerId}`);
      });

      socket.on('driver_location', (data: { partnerId: string; lat: number; lng: number; orderId?: string }) => {
        this.broadcast('delivery_location_update', data);
      });
    });
  }

  public subscribe(res: Response): void {
    this.clients.add(res);

    res.on('close', () => {
      this.clients.delete(res);
    });
  }

  public broadcast(type: RealtimeEvent['type'], payload: any): void {
    const event: RealtimeEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    // 1. Broadcast to SSE clients
    const data = `data: ${JSON.stringify(event)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (e) {
        this.clients.delete(client);
      }
    }

    // 2. Broadcast via Socket.IO
    if (this.io) {
      try {
        // Global broadcast
        this.io.emit('realtime_event', event);
        this.io.emit(type, payload);

        // Targeted room broadcasts
        if (payload?.storeId) {
          this.io.to(`store:${payload.storeId}`).emit(type, payload);
        }
        if (payload?.orderId) {
          this.io.to(`order:${payload.orderId}`).emit(type, payload);
        }
        if (payload?.assignedPartnerId) {
          this.io.to(`partner:${payload.assignedPartnerId}`).emit(type, payload);
        }
      } catch (err) {
        console.warn('Socket.IO broadcast error:', err);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.clients.size + (this.io ? this.io.engine.clientsCount : 0);
  }
}

export const realtimeHub = new RealtimeHub();
