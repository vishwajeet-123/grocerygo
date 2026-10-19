import { Response } from 'express';

export interface RealtimeEvent {
  type:
    | 'order_created'
    | 'order_updated'
    | 'inventory_updated'
    | 'delivery_assigned'
    | 'delivery_location_update'
    | 'announcement'
    | 'platform_config_updated';
  payload: any;
  timestamp: string;
}

class RealtimeHub {
  private clients: Set<Response> = new Set();

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

    const data = `data: ${JSON.stringify(event)}\n\n`;

    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  public getSubscriberCount(): number {
    return this.clients.size;
  }
}

export const realtimeHub = new RealtimeHub();
