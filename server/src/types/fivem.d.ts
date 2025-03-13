/**
 * FiveM-spezifische Typdefinitionen für den Server
 * 
 * Diese Datei enthält Typendefinitionen für FiveM-Natives, die auf der Server-Seite verfügbar sind.
 * Die Natives sind in Kategorien organisiert, um die Übersichtlichkeit zu verbessern.
 * 
 * Referenz: https://docs.fivem.net/natives/
 */

/**
 * ===================================
 * Allgemeine Funktionen
 * ===================================
 */

/**
 * Gibt den aktuellen Ressourcennamen zurück
 * @returns Name der aktuellen Ressource
 */
declare function GetCurrentResourceName(): string;

/**
 * Gibt den Status einer Ressource zurück
 * @param resourceName Name der Ressource
 * @returns Status der Ressource (z.B. "started", "stopped")
 */
declare function GetResourceState(resourceName: string): string;

/**
 * ===================================
 * Entity-bezogene Funktionen
 * ===================================
 */

/**
 * Gibt die Koordinaten einer Entity zurück
 * @param entity Entity-Handle
 * @param alive Ob die Entity lebendig sein muss
 * @returns Koordinaten als [x, y, z]
 */
declare function GetEntityCoords(entity: number, alive?: boolean): [number, number, number];

/**
 * Gibt die Distanz zwischen zwei Koordinaten zurück
 * @param x1 X-Koordinate des ersten Punktes
 * @param y1 Y-Koordinate des ersten Punktes
 * @param z1 Z-Koordinate des ersten Punktes
 * @param x2 X-Koordinate des zweiten Punktes
 * @param y2 Y-Koordinate des zweiten Punktes
 * @param z2 Z-Koordinate des zweiten Punktes
 * @param useZ Ob die Z-Koordinate berücksichtigt werden soll
 * @returns Distanz zwischen den Punkten
 */
declare function GetDistanceBetweenCoords(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, useZ: boolean): number;

/**
 * ===================================
 * Spieler-bezogene Funktionen
 * ===================================
 */

/**
 * Gibt das Ped-Handle eines Spielers zurück
 * @param player Spieler-ID
 * @returns Ped-Handle des Spielers
 */
declare function GetPlayerPed(player: number): number;

/**
 * Gibt eine Liste aller verbundenen Spieler zurück
 * @returns Array mit Spieler-IDs
 */
declare function GetPlayers(): string[];

/**
 * Gibt den Namen eines Spielers zurück
 * @param player Spieler-ID
 * @returns Name des Spielers
 */
declare function GetPlayerName(player: number): string;

/**
 * Gibt die Identifikatoren eines Spielers zurück (z.B. steam:, license:, ip:)
 * @param player Spieler-ID
 * @returns Array mit Identifikatoren
 */
declare function GetPlayerIdentifiers(player: number): string[];

/**
 * Gibt die IP-Adresse eines Spielers zurück
 * @param player Spieler-ID
 * @returns IP-Adresse des Spielers
 */
declare function GetPlayerEndpoint(player: number): string;

/**
 * Gibt den Ping eines Spielers zurück
 * @param player Spieler-ID
 * @returns Ping des Spielers in Millisekunden
 */
declare function GetPlayerPing(player: number): number;

/**
 * Gibt die Zeit seit der letzten Nachricht eines Spielers zurück
 * @param player Spieler-ID
 * @returns Zeit in Millisekunden
 */
declare function GetPlayerLastMsg(player: number): number;

/**
 * Prüft, ob ein Spieler ein bestimmtes ACE-Objekt hat
 * @param player Spieler-ID
 * @param object ACE-Objekt
 * @returns Ob der Spieler das ACE-Objekt hat
 */
declare function GetPlayerAce(player: number, object: string): boolean;

/**
 * Prüft, ob ein Spieler ein bestimmtes ACE-Objekt verwenden darf
 * @param player Spieler-ID
 * @param object ACE-Objekt
 * @returns Ob der Spieler das ACE-Objekt verwenden darf
 */
declare function IsPlayerAceAllowed(player: number, object: string): boolean;

/**
 * Kickt einen Spieler vom Server
 * @param player Spieler-ID
 * @param reason Grund für den Kick
 */
declare function DropPlayer(player: number, reason: string): void;

/**
 * Bannt einen Spieler temporär vom Server
 * @param player Spieler-ID
 * @param reason Grund für den Ban
 */
declare function TempBanPlayer(player: number, reason: string): void;

/**
 * ===================================
 * Event-bezogene Funktionen
 * ===================================
 */

/**
 * Registriert einen Event-Handler für ein Netzwerk-Event
 * @param eventName Name des Events
 * @param callback Callback-Funktion
 */
declare function onNet(eventName: string, callback: (...args: any[]) => void): void;

/**
 * Registriert einen Event-Handler für ein lokales Event
 * @param eventName Name des Events
 * @param callback Callback-Funktion
 */
declare function on(eventName: string, callback: (...args: any[]) => void): void;

/**
 * Sendet ein lokales Event
 * @param eventName Name des Events
 * @param args Argumente
 */
declare function emit(eventName: string, ...args: any[]): void;

/**
 * Sendet ein Event an einen oder alle Clients
 * @param eventName Name des Events
 * @param target Ziel-Client-ID oder -1 für alle Clients
 * @param args Argumente
 */
declare function emitNet(eventName: string, target: number | string, ...args: any[]): void;

/**
 * Sendet ein Event an einen oder alle Clients (alternative Syntax)
 * @param eventName Name des Events
 * @param target Ziel-Client-ID oder -1 für alle Clients
 * @param args Argumente
 */
declare function TriggerClientEvent(eventName: string, target: number | string, ...args: any[]): void;

/**
 * Sendet ein Event an den Server (lokal)
 * @param eventName Name des Events
 * @param args Argumente
 */
declare function TriggerEvent(eventName: string, ...args: any[]): void;

/**
 * ===================================
 * Globale Variablen
 * ===================================
 */

/**
 * Konfigurationsobjekt der Ressource
 */
declare const Config: any;

/**
 * Globales Objekt mit der Spieler-ID des aktuellen Event-Auslösers
 */
declare const global: {
    /**
     * Spieler-ID des aktuellen Event-Auslösers
     */
    source: number;
    [key: string]: any;
};

/**
 * ===================================
 * Exports
 * ===================================
 */

/**
 * Exports-Objekt für den Zugriff auf Exports anderer Ressourcen
 */
declare interface ExportsObject {
    [resourceName: string]: any;
}

/**
 * Exports-Objekt der aktuellen Ressource
 */
declare const exports: ExportsObject; 