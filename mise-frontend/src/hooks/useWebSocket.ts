import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Order } from '../types/entity.types';

interface UseWebSocketOptions {
  sessionToken?: string;
  restaurantId?: string;
  onOrderPlaced?: (order: Order) => void;
  onOrderStatusChanged?: (order: Order) => void;
  onOrderReady?: (order: Order) => void;
}

export function useWebSocket({ sessionToken, restaurantId, onOrderPlaced, onOrderStatusChanged, onOrderReady }: UseWebSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const onOrderPlacedRef = useRef(onOrderPlaced);
  const onOrderStatusChangedRef = useRef(onOrderStatusChanged);
  const onOrderReadyRef = useRef(onOrderReady);

  onOrderPlacedRef.current = onOrderPlaced;
  onOrderStatusChangedRef.current = onOrderStatusChanged;
  onOrderReadyRef.current = onOrderReady;

  useEffect(() => {
    if (!sessionToken && !restaurantId) return;

    const socket = io(`${import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:3000'}/orders`, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      if (sessionToken) socket.emit('subscribe-to-session', sessionToken);
      if (restaurantId) socket.emit('subscribe-to-kitchen', restaurantId);
    });
    socket.on('order:placed', (o: Order) => onOrderPlacedRef.current?.(o));
    socket.on('order:status-changed', (o: Order) => onOrderStatusChangedRef.current?.(o));
    socket.on('order:ready', (o: Order) => onOrderReadyRef.current?.(o));

    return () => { socket.disconnect(); };
  }, [sessionToken, restaurantId]);
}
