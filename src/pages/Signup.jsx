import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Phone, Stethoscope, Pencil } from 'lucide-react';
import { useAuth } from '../store/AuthProvider';
import { baseURL } from "../config";



// ⚠️ If you use ComboboxDemo, replace it or import it manually.
// For now, this version assumes you’ll keep ComboboxDemo as is.
export default function SignUp() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signUp } = useAuth();
    const [error, setError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [formData, setFormData] = useState({
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        speciality: '',
        bio: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)))
            return alert('Veuillez entrer une adresse e-mail valide');

        // Password validation
        const password = formData.password;
        if (password.length < 8) return alert('Le mot de passe doit contenir au moins 8 caractères.');
        if (!/[A-Z]/.test(password)) return alert('Le mot de passe doit contenir au moins une lettre majuscule.');
        if (!/[a-z]/.test(password)) return alert('Le mot de passe doit contenir au moins une lettre minuscule.');
        if (!/[0-9]/.test(password)) return alert('Le mot de passe doit contenir au moins un chiffre.');
        if (formData.password !== formData.confirmPassword)
            return alert('Les mots de passe ne correspondent pas.');

        const { confirmPassword, ...formDataWithoutConfirm } = formData;

        try {
            const response = await signUp({ ...formDataWithoutConfirm });

            if (!response) {
                setError(true);
                return;
            }

            if (response === 'email or Username unavailable') {
                setError('Email or Phone number unavailable');
                return;
            }

            window.location.href = "/home";
        } catch (error) {
            console.error('Error during sign-up:', error);
            alert('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
        }
    };

    return (
        <div className="relative min-h-screen w-full">
            {/* Background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

            {/* Content */}
            <div className="relative flex items-center justify-center min-h-screen p-4 z-10">
                <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Inscription</h2>
                        <p className="text-slate-600 dark:text-slate-300">Créez votre compte</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-start space-x-2 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-600 rounded-lg p-3 mb-6">
                            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Échec de connexion.</p>
                                <p className="text-sm">Veuillez vérifier vos informations d'identification.</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* fullName */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Nom complet</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Votre nom complet"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* PhoneNumber */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Numéro de téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                               
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="Votre numéro de téléphone"
                                    value={formData.phoneNumber}
                                    maxLength={10}
                                    onChange={(e) => {
                                        const onlyNumbers = e.target.value.replace(/[^0-9\s-]/g, "");
                                        setFormData({ ...formData, phoneNumber: onlyNumbers });
                                    }}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />

                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Votre mot de passe"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <small className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                                8 caractères, 1 majuscule, 1 minuscule, 1 chiffre
                            </small>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirmez votre mot de passe"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>




                        {/* speciality */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Spécialité</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Votre spécialité"
                                    value={formData.speciality}
                                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    required
                                />
                            </div>
                        </div>


                        {/* Bio */}
                        <div className="space-y-1">
                            <label className="text-slate-700 dark:text-slate-300 font-medium">Bio</label>
                            <div className="relative">
                                <Pencil className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
                                <textarea
                                    placeholder="Décrivez-vous en quelques mots..."
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-transparent rounded-lg py-2 pl-10 pr-3 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px] resize-none"
                                    required
                                />
                            </div>
                        </div>




                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-2 rounded-lg transition-all"
                        >
                            S'inscrire
                        </button>
                    </form>



                    {/* Login link */}
                    <div className="text-center text-sm mt-6">
                        <span className="text-slate-600 dark:text-slate-400">Déjà un compte ? </span>
                        <a
                            href="/login"
                            className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium"
                        >
                            Se connecter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
