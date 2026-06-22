import React from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import styles from './css_modules/ActivityChart.module.css';

export default function ActivityChart({ entries }) {
    const generateCalendarData = () => {
        const data = [];
        const today = new Date();

        const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        const entryMap = new Map();
        entries.forEach(e => {
            const d = new Date(e.createdAt).toLocaleDateString('en-CA');
            entryMap.set(d, true);
        });

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = new Date(d).toLocaleDateString('en-CA');
            const isFilled = entryMap.has(dateStr);
            data.push({
                date: dateStr,
                count: isFilled ? 1 : 0,
                level: isFilled ? 1 : 0,
            });
        }
        return data;
    };

    const calendarData = generateCalendarData();

    return (
        <div className={styles.chartBox}>
            <h3>Activity Calendar</h3>
            <div className={styles.calendarWrapper}>
                <ActivityCalendar
                    data={calendarData}
                    maxLevel={1}

                    blockSize={14}
                    blockMargin={3}
                    fontSize={12}

                    colorScheme="light"
                    theme={{
                        light: ['var(--bg-main)', '#2ecc71'],
                        dark: ['var(--bg-main)', '#2ecc71']
                    }}

                    labels={{
                        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                        totalCount: '{{count}} entries in the last year',
                    }}

                    hideColorLegend={true}


                    renderBlock={(block, activity) =>
                        React.cloneElement(block, {
                            'data-tooltip-id': 'calendar-tooltip',
                            'data-tooltip-content': `${activity.date}: ${activity.count > 0 ? 'Entry added' : 'No entry'}`,
                        })
                    }
                />
                <Tooltip id="calendar-tooltip" />
            </div>
        </div>
    );
}