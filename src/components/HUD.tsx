import React, { useEffect, useState } from 'react';
import styles from '@/styles/HUD.module.css';
import { EventBus } from '@/game/EventBus';

interface CritterInfo {
    id: string;
    nickname: string;
    species: string;
    currentHP: number;
    maxHP: number;
    level: number;
}

interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
}

interface HUDProps {
    onPause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onPause }) => {
    const [money, setMoney] = useState(0);
    const [badges, setBadges] = useState(0);
    const [party, setParty] = useState<CritterInfo[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentArea, setCurrentArea] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleMoneyUpdate = (data: { money: number }) => {
            setMoney(data.money);
        };

        const handleBadgeEarned = (data: { badgeId: string; totalBadges: number }) => {
            setBadges(data.totalBadges);
            addNotification(`Badge earned: ${data.badgeId}!`, 'success');
        };

        const handlePartyUpdate = (data: { party: CritterInfo[] }) => {
            setParty(data.party);
        };

        const handleAreaChanged = (data: { fromArea: string; toArea: string }) => {
            setCurrentArea(data.toArea);
            addNotification(`Entered: ${data.toArea}`, 'info');
        };

        const handleBattleStart = (data: { isWildEncounter: boolean }) => {
            addNotification(data.isWildEncounter ? 'Wild encounter!' : 'Trainer battle!', 'warning');
        };

        const handleBattleVictory = () => {
            addNotification('Victory!', 'success');
        };

        const handleBattleDefeat = () => {
            addNotification('Defeated...', 'error');
        };

        const handleLevelUp = (data: { critterId: string; newLevel: number }) => {
            addNotification(`Critter reached level ${data.newLevel}!`, 'success');
        };

        const handleItemCollected = (data: { itemId: string; quantity: number }) => {
            addNotification(`Found ${data.quantity}x ${data.itemId}!`, 'success');
        };

        const handleNotificationShow = (data: { message: string; type: string; duration?: number }) => {
            addNotification(data.message, data.type as any, data.duration);
        };

        const handleSaveNotification = (data: { type: string; message: string }) => {
            addNotification(data.message, data.type as any);
        };

        const handleMenuOpen = (data?: { menuType?: string }) => {
            setIsMenuOpen(true);
        };

        const handleMenuClose = () => {
            setIsMenuOpen(false);
        };

        const addNotification = (message: string, type: Notification['type'], duration = 3000) => {
            const id = Date.now().toString();
            setNotifications(prev => [...prev, { id, message, type, duration }]);
            
            if (duration > 0) {
                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                }, duration);
            }
        };

        EventBus.on('money:updated', handleMoneyUpdate);
        EventBus.on('badge:earned', handleBadgeEarned);
        EventBus.on('party:updated', handlePartyUpdate);
        EventBus.on('area:changed', handleAreaChanged);
        EventBus.on('battle:start', handleBattleStart);
        EventBus.on('battle:victory', handleBattleVictory);
        EventBus.on('battle:defeat', handleBattleDefeat);
        EventBus.on('level:up', handleLevelUp);
        EventBus.on('item:collected', handleItemCollected);
        EventBus.on('notification:show', handleNotificationShow);
        EventBus.on('save:notification', handleSaveNotification);
        EventBus.on('menu:open', handleMenuOpen);
        EventBus.on('menu:close', handleMenuClose);

        return () => {
            EventBus.removeListener('money:updated', handleMoneyUpdate);
            EventBus.removeListener('badge:earned', handleBadgeEarned);
            EventBus.removeListener('party:updated', handlePartyUpdate);
            EventBus.removeListener('area:changed', handleAreaChanged);
            EventBus.removeListener('battle:start', handleBattleStart);
            EventBus.removeListener('battle:victory', handleBattleVictory);
            EventBus.removeListener('battle:defeat', handleBattleDefeat);
            EventBus.removeListener('level:up', handleLevelUp);
            EventBus.removeListener('item:collected', handleItemCollected);
            EventBus.removeListener('notification:show', handleNotificationShow);
            EventBus.removeListener('save:notification', handleSaveNotification);
            EventBus.removeListener('menu:open', handleMenuOpen);
            EventBus.removeListener('menu:close', handleMenuClose);
        };
    }, []);

    const handlePause = () => {
        if (onPause) {
            onPause();
        }
        EventBus.emit('menu:open');
    };

    return (
        <div className={styles.hudContainer}>
            <div className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <div className={styles.playerInfo}>
                        {currentArea && (
                            <div className={styles.areaInfo}>
                                <span>📍</span>
                                <span>{currentArea}</span>
                            </div>
                        )}
                        <div className={styles.badgeInfo}>
                            <span>🏅</span>
                            <span>Badges:</span>
                            <span className={styles.badgeCount}>{badges}</span>
                        </div>
                    </div>
                </div>
                <div className={styles.topBarRight}>
                    <div className={styles.moneyInfo}>
                        <span>💰</span>
                        <span className={styles.moneyAmount}>${money}</span>
                    </div>
                    <button 
                        className={`${styles.pauseButton} ${isMenuOpen ? styles.active : ''}`} 
                        onClick={handlePause}
                    >
                        {isMenuOpen ? 'CLOSE (M)' : 'PAUSE (M)'}
                    </button>
                </div>
            </div>

            {party.length > 0 && (
                <div className={styles.partyPanel}>
                    <div className={styles.partyTitle}>Party</div>
                    <div className={styles.partyMemberList}>
                        {party.map((critter) => {
                            const healthPercent = (critter.currentHP / critter.maxHP) * 100;
                            return (
                                <div key={critter.id} className={styles.partyMember}>
                                    <div className={styles.partyMemberName}>
                                        {critter.nickname || critter.species} Lv.{critter.level}
                                    </div>
                                    <div className={styles.healthBar}>
                                        <div
                                            className={styles.healthBarFill}
                                            style={{ '--health-percent': `${healthPercent}%` } as React.CSSProperties}
                                        />
                                    </div>
                                    <div className={styles.healthText}>
                                        {critter.currentHP}/{critter.maxHP}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notifications */}
            <div className={styles.notificationsContainer}>
                {notifications.map((notification) => (
                    <div 
                        key={notification.id} 
                        className={`${styles.notification} ${styles[notification.type]}`}
                    >
                        {notification.message}
                    </div>
                ))}
            </div>

            <div className={styles.controlHints}>
                <div>M - Menu</div>
                <div>P - Party</div>
                <div>S - Shop</div>
                <div>SPACE - Interact</div>
            </div>
        </div>
    );
};

export default HUD;
