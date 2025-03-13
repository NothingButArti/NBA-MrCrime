/**
 * FiveM-spezifische Typdefinitionen für den Client
 * 
 * Diese Datei enthält Typendefinitionen für FiveM-Natives, die auf der Client-Seite verfügbar sind.
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
 * Wartet für die angegebene Zeit in Millisekunden
 * @param ms Zeit in Millisekunden
 * @returns Promise, das nach der angegebenen Zeit aufgelöst wird
 */
declare function Wait(ms: number): Promise<void>;

/**
 * Gibt den aktuellen Ressourcennamen zurück
 * @returns Name der aktuellen Ressource
 */
declare function GetCurrentResourceName(): string;

/**
 * Registriert eine Funktion, die in jedem Frame ausgeführt wird
 * @param handler Funktion, die in jedem Frame ausgeführt wird
 */
declare function setTick(handler: () => void): void;

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
 * Setzt die Koordinaten einer Entity
 * @param entity Entity-Handle
 * @param x X-Koordinate
 * @param y Y-Koordinate
 * @param z Z-Koordinate
 * @param xAxis Ob die X-Achse berücksichtigt werden soll
 * @param yAxis Ob die Y-Achse berücksichtigt werden soll
 * @param zAxis Ob die Z-Achse berücksichtigt werden soll
 * @param clearArea Ob der Bereich geleert werden soll
 */
declare function SetEntityCoords(entity: number, x: number, y: number, z: number, xAxis: boolean, yAxis: boolean, zAxis: boolean, clearArea: boolean): void;

/**
 * Gibt die Ausrichtung einer Entity zurück
 * @param entity Entity-Handle
 * @returns Ausrichtung in Grad
 */
declare function GetEntityHeading(entity: number): number;

/**
 * Setzt die Ausrichtung einer Entity
 * @param entity Entity-Handle
 * @param heading Ausrichtung in Grad
 */
declare function SetEntityHeading(entity: number, heading: number): void;

/**
 * ===================================
 * Spieler-bezogene Funktionen
 * ===================================
 */

/**
 * Gibt das Ped-Handle des lokalen Spielers zurück
 * @returns Ped-Handle des lokalen Spielers
 */
declare function PlayerPedId(): number;

/**
 * ===================================
 * Fahrzeug-bezogene Funktionen
 * ===================================
 */

/**
 * Gibt das Fahrzeug zurück, in dem ein Ped sitzt
 * @param ped Ped-Handle
 * @param lastVehicle Ob das letzte Fahrzeug zurückgegeben werden soll
 * @returns Fahrzeug-Handle
 */
declare function GetVehiclePedIsIn(ped: number, lastVehicle: boolean): number;

/**
 * Gibt den Kraftstoffstand eines Fahrzeugs zurück
 * @param vehicle Fahrzeug-Handle
 * @returns Kraftstoffstand
 */
declare function GetVehicleFuelLevel(vehicle: number): number;

/**
 * Setzt den Kraftstoffstand eines Fahrzeugs
 * @param vehicle Fahrzeug-Handle
 * @param level Kraftstoffstand
 */
declare function SetVehicleFuelLevel(vehicle: number, level: number): void;

/**
 * Gibt das Kennzeichen eines Fahrzeugs zurück
 * @param vehicle Fahrzeug-Handle
 * @returns Kennzeichen
 */
declare function GetVehicleNumberPlateText(vehicle: number): string;

/**
 * Setzt einen Ped in ein Fahrzeug
 * @param ped Ped-Handle
 * @param vehicle Fahrzeug-Handle
 * @param seatIndex Sitzindex
 */
declare function SetPedIntoVehicle(ped: number, vehicle: number, seatIndex: number): void;

/**
 * Erstellt ein Fahrzeug
 * @param modelHash Hash des Fahrzeugmodells
 * @param x X-Koordinate
 * @param y Y-Koordinate
 * @param z Z-Koordinate
 * @param heading Ausrichtung
 * @param isNetwork Ob das Fahrzeug über das Netzwerk synchronisiert werden soll
 * @param netMissionEntity Ob das Fahrzeug eine Missionsentität ist
 * @returns Fahrzeug-Handle
 */
declare function CreateVehicle(modelHash: number, x: number, y: number, z: number, heading: number, isNetwork: boolean, netMissionEntity: boolean): number;

/**
 * ===================================
 * Modell-bezogene Funktionen
 * ===================================
 */

/**
 * Gibt den Hash eines Modellnamens zurück
 * @param model Modellname
 * @returns Hash des Modells
 */
declare function GetHashKey(model: string): number;

/**
 * Fordert ein Modell an
 * @param model Hash des Modells
 */
declare function RequestModel(model: number): void;

/**
 * Prüft, ob ein Modell geladen ist
 * @param model Hash des Modells
 * @returns Ob das Modell geladen ist
 */
declare function HasModelLoaded(model: number): boolean;

/**
 * Markiert ein Modell als nicht mehr benötigt
 * @param model Hash des Modells
 */
declare function SetModelAsNoLongerNeeded(model: number): void;

/**
 * ===================================
 * UI-bezogene Funktionen
 * ===================================
 */

/**
 * Setzt den Fokus auf die NUI
 * @param hasFocus Ob der Fokus gesetzt werden soll
 * @param hasCursor Ob der Cursor angezeigt werden soll
 */
declare function SetNuiFocus(hasFocus: boolean, hasCursor: boolean): void;

/**
 * Sendet eine Nachricht an die NUI
 * @param data Daten, die an die NUI gesendet werden sollen
 */
declare function SendNUIMessage(data: any): void;

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
 * Sendet ein Event an den Server
 * @param eventName Name des Events
 * @param args Argumente
 */
declare function emitNet(eventName: string, ...args: any[]): void;

/**
 * Sendet ein Event an den Server (alternative Syntax)
 * @param eventName Name des Events
 * @param args Argumente
 */
declare function TriggerServerEvent(eventName: string, ...args: any[]): void;

/**
 * Registriert einen NUI-Callback
 * @param callbackName Name des Callbacks
 * @param callback Callback-Funktion
 */
declare function RegisterNuiCallback(callbackName: string, callback: (data: any, cb: (result: any) => void) => void): void;

/**
 * Registriert einen NUI-Callback-Typ
 * @param callbackType Typ des Callbacks
 */
declare function RegisterNuiCallbackType(callbackType: string): void;

/**
 * ===================================
 * Befehlsbezogene Funktionen
 * ===================================
 */

/**
 * Registriert einen Befehl
 * @param commandName Name des Befehls
 * @param handler Handler-Funktion
 * @param restricted Ob der Befehl eingeschränkt ist
 */
declare function RegisterCommand(commandName: string, handler: (...args: any[]) => void, restricted: boolean): void;

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
 * Exports-Objekt für den Zugriff auf Exports anderer Ressourcen
 */
declare interface ExportsObject {
    [resourceName: string]: any;
}

declare const exports: ExportsObject;

/**
 * Spieler-ID (nur auf dem Server verfügbar)
 */
declare const source: number;

/**
 * Deklariert globale FiveM-Funktionen, die nicht in @citizenfx/client enthalten sind
 */

declare function GetDistanceBetweenCoords(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, useZ: boolean): number;
declare function DrawMarker(
    type: number,
    posX: number,
    posY: number,
    posZ: number,
    dirX: number,
    dirY: number,
    dirZ: number,
    rotX: number,
    rotY: number,
    rotZ: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
    bobUpAndDown: boolean,
    faceCamera: boolean,
    p19: number,
    rotate: boolean,
    textureDict: string | null,
    textureName: string | null,
    drawOnEnts: boolean
): void;
declare function IsControlJustReleased(padIndex: number, control: number): boolean;
declare function SetTextScale(scale: number, scale2: number): void;
declare function SetTextFont(fontType: number): void;
declare function SetTextProportional(p0: boolean): void;
declare function SetTextColour(red: number, green: number, blue: number, alpha: number): void;
declare function SetTextDropShadow(distance?: number, r?: number, g?: number, b?: number, a?: number): void;
declare function SetTextEdge(p0: number, r: number, g: number, b: number, a: number): void;
declare function SetTextOutline(): void;
declare function SetTextEntry(text: string): void;
declare function SetTextCentre(align: boolean): void;
declare function AddTextComponentString(text: string): void;
declare function DrawText(x: number, y: number): void;
declare function SetDrawOrigin(x: number, y: number, z: number, p3: number): void;
declare function ClearDrawOrigin(): void;
declare function AddBlipForCoord(x: number, y: number, z: number): number;
declare function SetBlipSprite(blip: number, spriteId: number): void;
declare function SetBlipDisplay(blip: number, displayId: number): void;
declare function SetBlipScale(blip: number, scale: number): void;
declare function SetBlipColour(blip: number, color: number): void;
declare function SetBlipAsShortRange(blip: number, toggle: boolean): void;
declare function BeginTextCommandSetBlipName(textLabel: string): void;
declare function EndTextCommandSetBlipName(blip: number): void;
declare function SetNotificationTextEntry(type: string): void;
declare function DrawNotification(blink: boolean, showInBrief: boolean): number;
declare function BeginTextCommandDisplayHelp(text: string): void;
declare function EndTextCommandDisplayHelp(p0: number, loop: boolean, beep: boolean, duration: number): void;
declare function PlaySound(soundId: number, audioName: string, audioRef: string, p3: number, p4: number, p5: number): void;
declare function GetDistanceBetweenCoords(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, useZ: boolean): number;
declare function IsControlJustReleased(inputGroup: number, control: number): boolean;

// Blip Funktionen
declare function SetBlipDisplay(blip: number, display: number): void;
declare function SetBlipScale(blip: number, scale: number): void;
declare function SetBlipColour(blip: number, colour: number): void;
declare function SetBlipAsShortRange(blip: number, toggle: boolean): void;
declare function BeginTextCommandSetBlipName(textLabel: string): void;
declare function AddTextComponentString(text: string): void;
declare function EndTextCommandSetBlipName(blip: number): void;

// Marker Funktionen
declare function DrawMarker(
    type: number,
    posX: number,
    posY: number,
    posZ: number,
    dirX: number,
    dirY: number,
    dirZ: number,
    rotX: number,
    rotY: number,
    rotZ: number,
    scaleX: number,
    scaleY: number,
    scaleZ: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
    bobUpAndDown: boolean,
    faceCamera: boolean,
    p19: number,
    rotate: boolean,
    textureDict: string | null,
    textureName: string | null,
    drawOnEnts: boolean
): void;

// Resource Funktionen
declare function GetCurrentResourceName(): string; 