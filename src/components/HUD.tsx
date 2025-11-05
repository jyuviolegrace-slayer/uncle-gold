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

interface HUDProps {
    onPause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ onPause }) => {
    const [money, setMoney] = useState(0);
    const [badges, setBadges] = useState(0);
    const [party, setParty] = useState<CritterInfo[]>([]);

    useEffect(() => {
        const handleMoneyUpdate = (data: { money: number }) => {
            setMoney(data.money);
        };

        const handleBadgeEarned = (data: { badgeId: string; totalBadges: number }) => {
            setBadges(data.totalBadges);
        };

        const handlePartyUpdate = (data: { party: CritterInfo[] }) => {
            setParty(data.party);
        };

        EventBus.on('money:updated', handleMoneyUpdate);
        EventBus.on('badge:earned', handleBadgeEarned);
        EventBus.on('party:updated', handlePartyUpdate);

        return () => {
            EventBus.removeListener('money:updated', handleMoneyUpdate);
            EventBus.removeListener('badge:earned', handleBadgeEarned);
            EventBus.removeListener('party:updated', handlePartyUpdate);
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
                    <button className={styles.pauseButton} onClick={handlePause}>
                        PAUSE (M)
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
