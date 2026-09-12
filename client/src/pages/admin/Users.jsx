import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaKey, FaUsers, FaUser, FaUserMinus, FaTimes } from "react-icons/fa";
import api from "../../api/axios";

const roleColors = {
    owner: "text-yellow-600 dark:text-yellow-400",
    admin: "text-blue-600 dark:text-blue-400",
    staff: "text-green-600 dark:text-green-400",
    user: "text-gray-500 dark:text-gray-400",
};

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [resetUser, setResetUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [myPassword, setMyPassword] = useState({ current: "", newP: "", confirm: "" });
    const [myPwMsg, setMyPwMsg] = useState("");
    const [myPwErr, setMyPwErr] = useState("");
    const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "staff" });
    const [addErr, setAddErr] = useState("");
    const [addLoading, setAddLoading] = useState(false);

    const load = () => {
        setLoading(true);
        api.get("/auth/users")
            .then((res) => setUsers(res.data.users || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleAddUser = async (e) => {
        e.preventDefault();
        setAddErr("");
        setAddLoading(true);
        try {
            await api.post("/auth/users", addForm);
            setAddForm({ name: "", email: "", password: "", role: "staff" });
            setShowAddForm(false);
            load();
        } catch (err) {
            setAddErr(err.response?.data?.message || "Failed to create user");
        } finally {
            setAddLoading(false);
        }
    };

    const handleUpdateRole = async (id, role) => {
        try {
            await api.put(`/auth/users/${id}`, { role });
            load();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === "active" ? "disabled" : "active";
        try {
            await api.put(`/auth/users/${id}`, { status: newStatus });
            load();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/auth/users/${id}`);
            load();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }
        try {
            await api.put(`/auth/users/${resetUser.id}/password`, { newPassword });
            alert(`Password reset for ${resetUser.name}`);
            setResetUser(null);
            setNewPassword("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleChangeMyPassword = async (e) => {
        e.preventDefault();
        setMyPwMsg("");
        setMyPwErr("");
        if (myPassword.newP !== myPassword.confirm) {
            setMyPwErr("New passwords don't match");
            return;
        }
        try {
            await api.put("/auth/change-password", {
                currentPassword: myPassword.current,
                newPassword: myPassword.newP,
            });
            setMyPwMsg("Password updated");
            setMyPassword({ current: "", newP: "", confirm: "" });
        } catch (err) {
            setMyPwErr(err.response?.data?.message || "Failed");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-heading dark:text-dark-text-heading">User Management</h1>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted">{users.length} users</p>
                </div>
                <button
                    onClick={() => { setShowAddForm(true); setAddErr(""); setAddForm({ name: "", email: "", password: "", role: "staff" }); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
                >
                    <FaPlus size={14} /> Add User
                </button>
            </div>

            {/* Change own password */}
            <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border p-6 mb-8">
                <h2 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-4">Change My Password</h2>
                <form onSubmit={handleChangeMyPassword} className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Current Password</label>
                        <input type="password" value={myPassword.current} onChange={(e) => setMyPassword({ ...myPassword, current: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">New Password</label>
                        <input type="password" value={myPassword.newP} onChange={(e) => setMyPassword({ ...myPassword, newP: e.target.value })} required minLength={6} className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm" />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-text-muted dark:text-dark-text-muted mb-1">Confirm</label>
                        <input type="password" value={myPassword.confirm} onChange={(e) => setMyPassword({ ...myPassword, confirm: e.target.value })} required minLength={6} className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap">Update</button>
                </form>
                {myPwMsg && <p className="text-green-600 dark:text-green-400 text-sm mt-2">{myPwMsg}</p>}
                {myPwErr && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{myPwErr}</p>}
            </div>

            {/* Users table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white dark:bg-dark-surface-alt rounded-xl border border-border dark:border-dark-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border dark:border-dark-border">
                                    <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">User</th>
                                    <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Role</th>
                                    <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Status</th>
                                    <th className="text-left px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Last Login</th>
                                    <th className="text-right px-4 py-3 font-medium text-text-muted dark:text-dark-text-muted">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-b border-border dark:border-dark-border last:border-0 hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-text-heading dark:text-dark-text-heading">{u.name}</p>
                                            <p className="text-xs text-text-muted dark:text-dark-text-muted">{u.email}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface ${roleColors[u.role]}`}
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="staff">Staff</option>
                                                <option value="user">User</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                                u.status === "active"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                            }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-text-muted dark:text-dark-text-muted">
                                            {u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => { setResetUser(u); setNewPassword(""); }} className="p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface text-text-muted hover:text-primary transition-colors" title="Reset password">
                                                    <FaKey size={13} />
                                                </button>
                                                <button onClick={() => handleToggleStatus(u.id, u.status)} className={`p-2 rounded-lg hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors ${u.status === "active" ? "text-text-muted hover:text-red-500" : "text-text-muted hover:text-green-500"}`} title={u.status === "active" ? "Disable" : "Enable"}>
                                                    <FaUserMinus size={13} />
                                                </button>
                                                <button onClick={() => handleDelete(u.id, u.name)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-text-muted hover:text-red-500 transition-colors" title="Delete">
                                                    <FaTrash size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add user modal */}
            {showAddForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-6 w-full max-w-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading">Add New User</h3>
                            <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-text-heading dark:hover:text-dark-text-heading">
                                <FaTimes size={18} />
                            </button>
                        </div>
                        {addErr && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{addErr}</p>}
                        <form onSubmit={handleAddUser} className="space-y-3">
                            <input
                                type="text"
                                placeholder="Full name"
                                required
                                value={addForm.name}
                                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={addForm.email}
                                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                            />
                            <input
                                type="password"
                                placeholder="Password (min 6 chars)"
                                required
                                minLength={6}
                                value={addForm.password}
                                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                            />
                            <select
                                value={addForm.role}
                                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm"
                            >
                                <option value="staff">Staff</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                                <option value="owner">Owner</option>
                            </select>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-sm font-medium rounded-lg border border-border dark:border-dark-border text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">Cancel</button>
                                <button type="submit" disabled={addLoading} className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
                                    {addLoading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset password modal */}
            {resetUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white dark:bg-dark-surface-alt rounded-2xl border border-border dark:border-dark-border p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-text-heading dark:text-dark-text-heading mb-4">
                            Reset Password — {resetUser.name}
                        </h3>
                        <input
                            type="password"
                            placeholder="New password (min 6 chars)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-white dark:bg-dark-surface text-text dark:text-dark-text text-sm mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => { setResetUser(null); setNewPassword(""); }} className="flex-1 py-2 text-sm font-medium rounded-lg border border-border dark:border-dark-border text-text dark:text-dark-text hover:bg-surface-alt dark:hover:bg-dark-surface transition-colors">Cancel</button>
                            <button onClick={handleResetPassword} className="flex-1 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">Reset</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
