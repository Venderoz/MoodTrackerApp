import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Tag, LogOut, CheckCircle2, Trash2, Plus, Pencil, Check, X, AlertTriangle } from 'lucide-react';
import { getProfile, updateProfile, createLabel, updateLabel, deleteLabel } from '../api/conn';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
    const { labels: availableLabels, refreshData } = useOutletContext();

    const [profile, setProfile] = useState({ email: '', firstName: '', lastName: '', birthDate: '' });
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState('#a855f7');
    const [labelError, setLabelError] = useState('');

    const [editingLabel, setEditingLabel] = useState(null);

    const [labelToDelete, setLabelToDelete] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileData = await getProfile();
                setProfile({
                    email: profileData.email || '',
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    birthDate: profileData.birthDate || ''
                });
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setIsProfileSaving(true);
        setProfileMessage({ type: '', text: '' });

        try {
            const updatedProfile = await updateProfile(profile);
            localStorage.setItem('firstName', updatedProfile.firstName);
            setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setProfileMessage({ type: 'error', text: error.message });
        } finally {
            setIsProfileSaving(false);
        }
    };

    const handleAddLabel = async (e) => {
        e.preventDefault();
        setLabelError('');
        if (!newLabelName.trim()) return;

        try {
            await createLabel({ name: newLabelName.trim(), colorHex: newLabelColor });
            setNewLabelName('');
            setNewLabelColor('#a855f7');
            await refreshData();
        } catch (error) {
            console.error(error);
            setLabelError(error.message);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setLabelError('');
        try {
            await updateLabel(editingLabel.id, { name: editingLabel.name.trim(), colorHex: editingLabel.colorHex });
            setEditingLabel(null);
            await refreshData();
        } catch (error) {
            console.error(error);
            setLabelError(error.message || 'Failed to update factor');
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteLabel(labelToDelete);
            setLabelToDelete(null);
            await refreshData();
        } catch (error) {
            console.error(error);
            setLabelError('Failed to delete factor.');
            setLabelToDelete(null);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    if (isLoading) {
        return <div className={styles.loadingState}>Loading settings...</div>;
    }

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Settings</h1>
                <p className={styles.subText}>Manage your account preferences and custom factors.</p>
            </div>

            <div className={styles.cardsGrid}>

                <div className={styles.settingsCard}>
                    <div className={styles.cardHeader}>
                        <User size={24} className={styles.cardIcon} />
                        <h2>Personal Information</h2>
                    </div>

                    {profileMessage.text && (
                        <div className={`${styles.alert} ${styles[profileMessage.type]}`}>
                            {profileMessage.type === 'success' && <CheckCircle2 size={18} />}
                            {profileMessage.text}
                        </div>
                    )}

                    <form onSubmit={handleSaveProfile} className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>First Name</label>
                            <input type="text" name="firstName" value={profile.firstName} onChange={handleProfileChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Last Name</label>
                            <input type="text" name="lastName" value={profile.lastName} onChange={handleProfileChange} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <input type="email" name="email" value={profile.email} onChange={handleProfileChange} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Birth Date</label>
                            <input type="date" name="birthDate" value={profile.birthDate} onChange={handleProfileChange} />
                        </div>

                        <button type="submit" className={styles.saveBtn} disabled={isProfileSaving}>
                            {isProfileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className={styles.settingsCard}>
                    <div className={styles.cardHeader}>
                        <Tag size={24} className={styles.cardIcon} />
                        <h2>Mood Factors</h2>
                    </div>
                    <p className={styles.cardDesc}>Define custom activities or triggers that influence your daily mood.</p>

                    <form onSubmit={handleAddLabel} className={styles.addLabelForm}>
                        {labelError && <div className={`${styles.alert} ${styles.error}`}>{labelError}</div>}
                        <div className={styles.labelInputGroup}>
                            <input
                                type="color"
                                value={newLabelColor}
                                onChange={(e) => setNewLabelColor(e.target.value)}
                                className={styles.colorPicker}
                            />
                            <input
                                type="text"
                                placeholder="New mood factor..."
                                value={newLabelName}
                                onChange={(e) => setNewLabelName(e.target.value)}
                                maxLength={30}
                                required
                                className={styles.labelTextInput}
                            />
                            <button type="submit" className={styles.addBtn} title="Add factor"><Plus size={20} /></button>
                        </div>
                    </form>

                    <div className={styles.labelsList}>
                        {availableLabels.length === 0 ? (
                            <p className={styles.emptyText}>No factors added yet.</p>
                        ) : (
                            availableLabels.map(label => (
                                <div key={label.id} className={styles.labelRowWrapper}>
                                    {editingLabel?.id === label.id ? (
                                        <form className={styles.editLabelForm} onSubmit={handleSaveEdit}>
                                            <input
                                                type="color"
                                                value={editingLabel.colorHex}
                                                onChange={(e) => setEditingLabel({ ...editingLabel, colorHex: e.target.value })}
                                                className={styles.colorPicker}
                                            />
                                            <input
                                                type="text"
                                                value={editingLabel.name}
                                                onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                                                maxLength={30}
                                                required
                                                className={styles.labelTextInput}
                                            />
                                            <div className={styles.editActions}>
                                                <button type="submit" className={styles.confirmEditBtn} title="Save"><Check size={18} /></button>
                                                <button type="button" onClick={() => setEditingLabel(null)} className={styles.cancelEditBtn} title="Cancel"><X size={18} /></button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className={styles.labelRow}>
                                            <div className={styles.labelInfo}>
                                                <span className={styles.colorDot} style={{ backgroundColor: label.colorHex }}></span>
                                                <span className={styles.labelName}>{label.name}</span>
                                            </div>
                                            <div className={styles.rowActions}>
                                                <button onClick={() => setEditingLabel({ id: label.id, name: label.name, colorHex: label.colorHex })} className={styles.editBtn} title="Edit">
                                                    <Pencil size={18} />
                                                </button>
                                                <button onClick={() => setLabelToDelete(label.id)} className={styles.deleteBtn} title="Delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.settingsCard}>
                    <div className={styles.cardHeader}>
                        <LogOut size={24} className={styles.cardIcon} color="#e74c3c" />
                        <h2 style={{ color: '#e74c3c' }}>Session</h2>
                    </div>
                    <p className={styles.cardDesc}>Ready to wrap up for today? Securely end your session.</p>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Log Out
                    </button>
                </div>

            </div>

            {labelToDelete && (
                <div className={styles.modalOverlay}>
                    <div className={styles.customModal}>
                        <div className={styles.modalHeader}>
                            <AlertTriangle size={32} color="#e74c3c" />
                            <h3>Delete Factor?</h3>
                        </div>
                        <p>Are you sure you want to remove this mood factor? This action cannot be undone.</p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setLabelToDelete(null)} className={styles.modalCancelBtn}>Cancel</button>
                            <button onClick={confirmDelete} className={styles.modalDeleteBtn}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}