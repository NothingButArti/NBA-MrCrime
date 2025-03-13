/**
 * Grundlegende Typdefinitionen für die FiveM-Boilerplate
 */

/**
 * 3D-Vektor für Positionen
 */
export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

/**
 * Basistyp für alle Konfigurationsobjekte
 */
export interface BaseConfig {
    enabled: boolean;
    debug?: boolean;
}

/**
 * Spieler-Daten Interface
 */
export interface PlayerData {
    source: number;
    citizenid: string;
    license: string;
    name: string;
    money: Record<string, number>;
    charinfo: {
        firstname: string;
        lastname: string;
        birthdate: string;
        gender: number;
        nationality: string;
    };
    metadata: Record<string, any>;
    job: Job;
}

/**
 * Job-Daten Interface
 */
export interface Job {
    name: string;
    label: string;
    payment: number;
    type?: string;
    grade: {
        name: string;
        level: number;
    };
}

/**
 * Menü-Item Interface (für UI-Menüs)
 */
export interface MenuItem {
    header: string;
    txt?: string;
    icon?: string;
    isMenuHeader?: boolean;
    disabled?: boolean;
    params?: {
        event: string;
        args: Record<string, any>;
    };
}

/**
 * Notification Interface
 */
export interface Notification {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    title?: string;
    duration?: number;
}

/**
 * Event-Callback Interface
 */
export interface EventCallback<T = any> {
    (data: T): void;
}

/**
 * Server-Callback Interface
 */
export interface ServerCallback<T = any, R = any> {
    (source: number, data: T, cb: (result: R) => void): void;
}

/**
 * Client-Callback Interface
 */
export interface ClientCallback<T = any, R = any> {
    (data: T, cb: (result: R) => void): void;
}

/**
 * Missions-bezogene Typen
 */
export namespace MissionTypes {
    export type MissionType = 'steal_item' | 'steal_money' | 'steal_weapon' | 'steal_vehicle' | 'robbery';
    
    export interface ItemData {
        name: string;
        amount: number;
    }
    
    export interface MissionReward {
        money: number;
        xp: number;
        items?: ItemData[];
    }
    
    export interface MissionLocation {
        x: number;
        y: number;
        z: number;
    }
    
    export interface MissionItemData {
        itemName: string;
        itemLabel: string;
        itemDescription: string;
        itemImage: string;
        itemModel: string;
        [key: string]: any;
    }
    
    export interface CrimeMission {
        id: string;
        title: string;
        description: string;
        requiredLevel: number;
        hint: string;
        missionType: MissionType;
        reward: MissionReward;
        data: MissionItemData;
        location: MissionLocation;
    }
}

/**
 * Mission-Status Enum
 */
export enum MissionStep {
    NONE = 'none',
    GOTO_LOCATION = 'goto_location',
    COLLECT_ITEM = 'collect_item',
    ROB_STORE = 'rob_store',
    STEAL_VEHICLE = 'steal_vehicle',
    RETURN_TO_NPC = 'return_to_npc'
}

