"use client";

import { useEffect, useState } from "react";

import type { AmbulanceReading } from "@/types";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

export function useAmbulances() {
  const [ambulances, setAmbulances] = useState<AmbulanceReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    let isMounted = true;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const loadAmbulances = async () => {
      try {
        if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
        const response = await fetch(`${API_URL}/api/ambulances`);
        if (!response.ok) throw new Error(`Unable to load ambulances (${response.status})`);
        const readings: AmbulanceReading[] = await response.json();
        if (isMounted) setAmbulances(readings);
      } catch (error) {
        console.error("Failed to fetch ambulances:", error);
      }
    };

    const connect = () => {
      if (!isMounted) return;
      if (!WS_URL) {
        setConnectionStatus("disconnected");
        console.error("NEXT_PUBLIC_WS_URL is not configured");
        return;
      }
      setConnectionStatus("connecting");
      socket = new WebSocket(WS_URL);

      socket.onopen = () => {
        if (isMounted) setConnectionStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          const reading = JSON.parse(event.data) as AmbulanceReading;
          if (!isMounted) return;
          setAmbulances((current) => {
            const existingIndex = current.findIndex(
              (ambulance) => ambulance.ambulance_id === reading.ambulance_id,
            );
            if (existingIndex === -1) return [...current, reading];
            const updated = [...current];
            updated[existingIndex] = reading;
            return updated;
          });
        } catch (error) {
          console.error("Received invalid ambulance WebSocket message:", error);
        }
      };

      socket.onerror = () => {
        if (isMounted) setConnectionStatus("disconnected");
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setConnectionStatus("disconnected");
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    void loadAmbulances();
    connect();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return { ambulances, connectionStatus };
}
