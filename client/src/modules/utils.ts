export function showNotification(message: string, type: 'success' | 'error' | 'primary' | 'warning', length: number = 5000): void {
    emit('QBCore:Notify', {
        text: message,
        type,
        length
    });
}