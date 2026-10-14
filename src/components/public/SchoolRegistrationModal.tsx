import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { School as SchoolIcon, X, CheckCircle2, Building, User, Users, AlertCircle } from 'lucide-react';
import { School, SchoolType } from '../../types';

interface SchoolRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolRegistrationModal: React.FC<SchoolRegistrationModalProps> = ({ isOpen, onClose }) => {
  const { lang, t, registerSchool, competition } = useCompetition();

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    schoolType: 'private' as SchoolType,
    governorate: 'Amman Capital Governorate',
    cityArea: '',
    address: '',
    phone: '',
    email: '',
    representativeName: '',
    representativeJobTitle: '',
    representativeEmail: '',
    representativeMobile: '',
    expectedTeams: 2,
    expectedStudents: 8,
  });

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submittedSchool, setSubmittedSchool] = useState<School | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr.trim() || !formData.nameEn.trim()) {
      setErrorMsg(lang === 'ar' ? 'يرجى إدخال اسم المدرسة باللغتين العربية والإنجليزية.' : 'Please provide school name in both Arabic and English.');
      return;
    }
    if (!formData.representativeName.trim() || !formData.representativeEmail.trim() || !formData.representativeMobile.trim()) {
      setErrorMsg(lang === 'ar' ? 'يرجى إكمال بيانات ممثل المدرسة.' : 'Please complete school representative details.');
      return;
    }
    if (!isAuthorized || !acceptTerms) {
      setErrorMsg(lang === 'ar' ? 'يجب تأكيد التفويض والموافقة على الشروط والأحكام.' : 'You must confirm authorization and accept competition terms.');
      return;
    }

    const created = registerSchool({
      competitionId: competition.id,
      ...formData,
    });
    setSubmittedSchool(created);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'ar' ? 'تسجيل مدرسة جديدة في تحدي التطبيقات' : 'Register Your School for App Challenge'}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'ar'
                  ? 'الخطوة الأولى: تسجيل المدرسة واعتمادها لتتمكن من إنشاء فرق الطلاب'
                  : 'Stage 1: Official school registration and accreditation to enable team creation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {submittedSchool ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {lang === 'ar' ? 'تم استلام طلب التسجيل بنجاح!' : 'Registration Submitted Successfully!'}
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {lang === 'ar'
                  ? `تم إرسال طلب تسجيل (${submittedSchool.nameAr}) إلى إدارة المسابقة. حالة الطلب الحالية: قيد الاعتماد. سيتم إرسال بيانات تفعيل حساب ممثل المدرسة فور الاعتماد.`
                  : `Your registration for "${submittedSchool.nameEn}" has been submitted to the Admin for approval. Current status: Pending Approval. Credentials will be sent upon review.`}
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 inline-block text-start">
                <p>
                  <strong>{lang === 'ar' ? 'المدرسة:' : 'School:'}</strong> {submittedSchool.nameEn}
                </p>
                <p>
                  <strong>{lang === 'ar' ? 'الممثل:' : 'Representative:'}</strong> {submittedSchool.representativeName}
                </p>
                <p>
                  <strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong> {submittedSchool.representativeEmail}
                </p>
                <p>
                  <strong>{lang === 'ar' ? 'الفرق المتوقعة:' : 'Expected Teams:'}</strong> {submittedSchool.expectedTeams}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  {lang === 'ar' ? 'إغلاق والعودة للبوابة' : 'Close and Return'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Section 1: School Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'ar' ? '1. معلومات المدرسة' : '1. School Information'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'اسم المدرسة (بالعربية) *' : 'School Name (Arabic) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: مدرسة النهضة الحديثة"
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'اسم المدرسة (بالإنجليزية) *' : 'School Name (English) *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Nahda Modern School"
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'نوع المدرسة' : 'School Type'}
                    </label>
                    <select
                      value={formData.schoolType}
                      onChange={(e) => setFormData({ ...formData, schoolType: e.target.value as SchoolType })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="public">{lang === 'ar' ? 'حكومية' : 'Public'}</option>
                      <option value="private">{lang === 'ar' ? 'خاصة' : 'Private'}</option>
                      <option value="other">{lang === 'ar' ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'المحافظة' : 'Governorate'}
                    </label>
                    <input
                      type="text"
                      value={formData.governorate}
                      onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'المدينة / المنطقة' : 'City / Area'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al-Jubaiha"
                      value={formData.cityArea}
                      onChange={(e) => setFormData({ ...formData, cityArea: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'هاتف المدرسة' : 'School Phone'}
                    </label>
                    <input
                      type="tel"
                      placeholder="+962 6 515 8890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني الرسمي للمدرسة' : 'Official School Email'}
                    </label>
                    <input
                      type="email"
                      placeholder="info@school.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: School Representative */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'ar' ? '2. بيانات ممثل المدرسة (المشرف المعتمد)' : '2. School Representative Details'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Muna Al-Sayed"
                      value={formData.representativeName}
                      onChange={(e) => setFormData({ ...formData, representativeName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Head of Computer Science"
                      value={formData.representativeJobTitle}
                      onChange={(e) => setFormData({ ...formData, representativeJobTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'البريد الإلكتروني للممثل *' : 'Representative Email *'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="muna.sayed@school.edu"
                      value={formData.representativeEmail}
                      onChange={(e) => setFormData({ ...formData, representativeEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'رقم الهاتف المحمول *' : 'Mobile Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+962 7 9512 3401"
                      value={formData.representativeMobile}
                      onChange={(e) => setFormData({ ...formData, representativeMobile: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Participation Info */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{lang === 'ar' ? '3. خطة المشاركة' : '3. Participation Plan'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'العدد المتوقع للفرق (بحد أقصى 5)' : 'Expected Number of Teams (Max 5)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={competition.maxTeamsPerSchool}
                      value={formData.expectedTeams}
                      onChange={(e) => setFormData({ ...formData, expectedTeams: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {lang === 'ar' ? 'العدد المتوقع للطلاب المشاركين' : 'Expected Total Students'}
                    </label>
                    <input
                      type="number"
                      min={3}
                      value={formData.expectedStudents}
                      onChange={(e) => setFormData({ ...formData, expectedStudents: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAuthorized}
                    onChange={(e) => setIsAuthorized(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-slate-700">
                    {lang === 'ar'
                      ? 'أؤكد بأنني مخول رسمياً من قبل إدارة المدرسة لتسجيلها في مسابقة تحدي التطبيقات 2026.'
                      : 'I confirm that I am officially authorized by school administration to register this school for App Challenge 2026.'}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-slate-700">
                    {lang === 'ar'
                      ? 'أوافق على الشروط والأحكام وميثاق المسابقة وحضور الطلاب للتدريب المكثف.'
                      : 'I agree to the competition rules, code of conduct, and mandatory training attendance.'}
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  {lang === 'ar' ? 'إرسال طلب التسجيل' : 'Submit School Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
