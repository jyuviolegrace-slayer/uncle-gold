import React, { useEffect, useRef } from 'react';
import styles from '@/styles/MobileControls.module.css';
import { EventBus } from '@/game/EventBus';

interface MobileControlsProps {
    isMobile?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ isMobile = false }) => {
    const activeKeysRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const isMobileDevice =
            isMobile || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobileDevice) {
            return;
        }
    }, [isMobile]);

    const handleUp = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowUp',
                code: 'ArrowUp',
                bubbles: true,
            })
        );
    };

    const handleUpEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: 'ArrowUp',
                code: 'ArrowUp',
                bubbles: true,
            })
        );
    };

    const handleDown = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowDown',
                code: 'ArrowDown',
                bubbles: true,
            })
        );
    };

    const handleDownEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: 'ArrowDown',
                code: 'ArrowDown',
                bubbles: true,
            })
        );
    };

    const handleLeft = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowLeft',
                code: 'ArrowLeft',
                bubbles: true,
            })
        );
    };

    const handleLeftEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: 'ArrowLeft',
                code: 'ArrowLeft',
                bubbles: true,
            })
        );
    };

    const handleRight = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowRight',
                code: 'ArrowRight',
                bubbles: true,
            })
        );
    };

    const handleRightEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: 'ArrowRight',
                code: 'ArrowRight',
                bubbles: true,
            })
        );
    };

    const handleInteract = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: ' ',
                code: 'Space',
                bubbles: true,
            })
        );
    };

    const handleInteractEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(
            new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                bubbles: true,
            })
        );
    };

    const handlePause = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault();
        EventBus.emit('menu:open', { menuType: 'pause' });
    };

    return (
        <div className={styles.mobileControlsContainer}>
            <div className={styles.dpadContainer}>
                <div className={styles.dpadRow}>
                    <div style={{ width: 44 }} />
                    <button
                        className={`${styles.dpadButton} ${styles.dpadButtonUp}`}
                        onTouchStart={handleUp}
                        onTouchEnd={handleUpEnd}
                        onMouseDown={handleUp}
                        onMouseUp={handleUpEnd}
                    />
                    <div style={{ width: 44 }} />
                </div>
                <div className={styles.dpadRow}>
                    <button
                        className={`${styles.dpadButton} ${styles.dpadButtonLeft}`}
                        onTouchStart={handleLeft}
                        onTouchEnd={handleLeftEnd}
                        onMouseDown={handleLeft}
                        onMouseUp={handleLeftEnd}
                    />
                    <button
                        className={`${styles.dpadButton} ${styles.dpadButtonDown}`}
                        onTouchStart={handleDown}
                        onTouchEnd={handleDownEnd}
                        onMouseDown={handleDown}
                        onMouseUp={handleDownEnd}
                    />
                    <button
                        className={`${styles.dpadButton} ${styles.dpadButtonRight}`}
                        onTouchStart={handleRight}
                        onTouchEnd={handleRightEnd}
                        onMouseDown={handleRight}
                        onMouseUp={handleRightEnd}
                    />
                </div>
            </div>

            <div className={styles.actionButtonsContainer}>
                <button
                    className={`${styles.actionButton} ${styles.interactButton}`}
                    onTouchStart={handleInteract}
                    onTouchEnd={handleInteractEnd}
                    onMouseDown={handleInteract}
                    onMouseUp={handleInteractEnd}
                    title="Interact (Space)"
                >
                    A
                </button>
                <button
                    className={`${styles.actionButton} ${styles.pauseButton}`}
                    onTouchStart={handlePause}
                    onMouseDown={handlePause}
                    title="Pause Menu"
                >
                    ⋮
                </button>
            </div>
        </div>
    );
};

export default MobileControls;
