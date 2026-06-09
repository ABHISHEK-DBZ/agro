import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Droplet,
  Share2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sprout,
  MapPin,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useSafeTranslation } from '../contexts/LanguageContext';
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  Button,
  Badge,
  FormField,
  Input,
  Modal,
  EmptyState,
  Skeleton,
} from '../components/ui';
import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SoilTestRecord {
  id: string;
  fieldName: string;
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicCarbon: number;
  createdAt?: Timestamp | null;
}

type NutrientLevel = 'low' | 'optimal' | 'high';
type HealthStatus = 'excellent' | 'good' | 'needsImprovement';

interface FormState {
  fieldName: string;
  ph: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  organicCarbon: string;
}

interface FormErrors {
  fieldName?: string;
  ph?: string;
  nitrogen?: string;
  phosphorus?: string;
  potassium?: string;
  organicCarbon?: string;
}

// ---------------------------------------------------------------------------
// Soil analysis helpers
// ---------------------------------------------------------------------------

/**
 * pH interpretation:
 *   < 6.0  -> low (acidic, lime recommended)
 *   6.0-7.5 -> optimal for most crops
 *   > 7.5  -> high (alkaline, gypsum/organic matter recommended)
 */
function classifyPh(ph: number): NutrientLevel {
  if (ph < 6.0) return 'low';
  if (ph > 7.5) return 'high';
  return 'optimal';
}

function classifyNutrient(value: number, lowThreshold: number): NutrientLevel {
  if (value < lowThreshold) return 'low';
  // Anything meaningfully above the threshold is "high", in-between is "optimal".
  if (value > lowThreshold * 1.4) return 'high';
  return 'optimal';
}

function buildRecommendations(
  ph: number,
  n: number,
  p: number,
  k: number,
  oc: number,
  t: (key: string) => string,
): string[] {
  const recs: string[] = [];

  if (ph < 6.0) recs.push(t('soil.recs.phLow'));
  else if (ph > 7.5) recs.push(t('soil.recs.phHigh'));
  else recs.push(t('soil.recs.phOptimal'));

  if (n < 280) recs.push(t('soil.recs.nLow'));
  if (p < 22) recs.push(t('soil.recs.pLow'));
  if (k < 140) recs.push(t('soil.recs.kLow'));
  if (oc < 0.5) recs.push(t('soil.recs.ocLow'));

  return recs;
}

function computeHealth(
  ph: number,
  n: number,
  p: number,
  k: number,
  oc: number,
): HealthStatus {
  const issues: number[] = [
    ph < 6.0 || ph > 7.5 ? 1 : 0, // pH out of optimal
    n < 280 ? 1 : 0,
    p < 22 ? 1 : 0,
    k < 140 ? 1 : 0,
    oc < 0.5 ? 1 : 0,
  ];
  const count = issues.reduce((a, b) => a + b, 0);
  if (count === 0) return 'excellent';
  if (count <= 2) return 'good';
  return 'needsImprovement';
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SoilTesting: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isLowBandwidthMode } = useSafeTranslation();
  const navigate = useNavigate();

  // -----------------------------------------------------------------------
  // State
  // -----------------------------------------------------------------------
  const [tests, setTests] = useState<SoilTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SoilTestRecord | null>(null);

  const [form, setForm] = useState<FormState>({
    fieldName: '',
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicCarbon: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // -----------------------------------------------------------------------
  // Subscribe to Firestore
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!user?.uid) {
      setTests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const testsRef = collection(db, 'users', user.uid, 'soilTests');
    const q = query(testsRef, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: SoilTestRecord[] = snap.docs.map((d) => {
          const data = d.data() as Partial<SoilTestRecord>;
          return {
            id: d.id,
            fieldName: data.fieldName ?? '',
            ph: typeof data.ph === 'number' ? data.ph : 0,
            nitrogen: typeof data.nitrogen === 'number' ? data.nitrogen : 0,
            phosphorus: typeof data.phosphorus === 'number' ? data.phosphorus : 0,
            potassium: typeof data.potassium === 'number' ? data.potassium : 0,
            organicCarbon: typeof data.organicCarbon === 'number' ? data.organicCarbon : 0,
            createdAt: (data.createdAt as Timestamp | null | undefined) ?? null,
          };
        });
        setTests(list);
        setLoading(false);
      },
      (err) => {
        console.error('SoilTesting: failed to subscribe to soilTests', err);
        setLoading(false);
        toast.error(t('common.error'));
      },
    );

    return () => unsub();
  }, [user?.uid, t]);

  // -----------------------------------------------------------------------
  // Form helpers
  // -----------------------------------------------------------------------
  const resetForm = () => {
    setForm({
      fieldName: '',
      ph: '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      organicCarbon: '',
    });
    setErrors({});
  };

  const handleChange = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const phNum = parseFloat(form.ph);
    const nNum = parseFloat(form.nitrogen);
    const pNum = parseFloat(form.phosphorus);
    const kNum = parseFloat(form.potassium);
    const ocNum = parseFloat(form.organicCarbon);

    if (form.fieldName.trim().length > 80) {
      next.fieldName = t('common.error');
    }
    if (Number.isNaN(phNum) || phNum < 0 || phNum > 14) {
      next.ph = '0-14';
    }
    if (Number.isNaN(nNum) || nNum < 0) {
      next.nitrogen = '>= 0';
    }
    if (Number.isNaN(pNum) || pNum < 0) {
      next.phosphorus = '>= 0';
    }
    if (Number.isNaN(kNum) || kNum < 0) {
      next.potassium = '>= 0';
    }
    if (Number.isNaN(ocNum) || ocNum < 0 || ocNum > 100) {
      next.organicCarbon = '0-100';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      toast.error(t('soil.loginRequired'));
      return;
    }
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      toast.error(t('soil.fixErrors'));
      return;
    }

    setSubmitting(true);
    try {
      const testsRef = collection(db, 'users', user.uid, 'soilTests');
      await addDoc(testsRef, {
        fieldName: form.fieldName.trim() || t('soil.untitled'),
        ph: parseFloat(form.ph),
        nitrogen: parseFloat(form.nitrogen),
        phosphorus: parseFloat(form.phosphorus),
        potassium: parseFloat(form.potassium),
        organicCarbon: parseFloat(form.organicCarbon),
        createdAt: serverTimestamp(),
      });
      toast.success(t('soil.testSaved'));
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('SoilTesting: failed to save test', err);
      toast.error(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------
  const handleConfirmDelete = async () => {
    if (!user?.uid || !confirmDelete) return;
    const id = confirmDelete.id;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'soilTests', id));
      toast.success(t('soil.testDeleted'));
      setConfirmDelete(null);
    } catch (err) {
      console.error('SoilTesting: failed to delete test', err);
      toast.error(t('common.error'));
    } finally {
      setDeletingId(null);
    }
  };

  // -----------------------------------------------------------------------
  // Share / copy
  // -----------------------------------------------------------------------
  const buildReportText = (test: SoilTestRecord): string => {
    const recs = buildRecommendations(
      test.ph,
      test.nitrogen,
      test.phosphorus,
      test.potassium,
      test.organicCarbon,
      t,
    );
    const dateStr = test.createdAt?.toDate
      ? test.createdAt.toDate().toLocaleDateString(i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';
    const health = computeHealth(test.ph, test.nitrogen, test.phosphorus, test.potassium, test.organicCarbon);

    return [
      `${t('soil.title')} — ${t('soil.summary')}`,
      `${t('soil.field')}: ${test.fieldName || t('soil.untitled')}`,
      dateStr ? `${t('soil.testDate')}: ${dateStr}` : '',
      '',
      `pH: ${test.ph}`,
      `N: ${test.nitrogen} mg/kg`,
      `P: ${test.phosphorus} mg/kg`,
      `K: ${test.potassium} mg/kg`,
      `OC: ${test.organicCarbon}%`,
      '',
      `${t('soil.recommendations')}:`,
      ...recs.map((r, i) => `  ${i + 1}. ${r}`),
      '',
      `Health: ${t(`soil.health.${health}`)}`,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const handleShare = async (test: SoilTestRecord) => {
    const text = buildReportText(test);
    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        try {
          await (navigator as Navigator).share({
            title: t('soil.title'),
            text,
          });
          return;
        } catch (err) {
          // User-cancelled share is fine; only fall through on real failures.
          if ((err as DOMException)?.name === 'AbortError') return;
        }
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success(t('soil.copied'));
      } else {
        toast.error(t('soil.shareError'));
      }
    } catch (err) {
      console.error('SoilTesting: share failed', err);
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          toast.success(t('soil.copied'));
        } else {
          toast.error(t('soil.shareError'));
        }
      } catch {
        toast.error(t('soil.shareError'));
      }
    }
  };

  // -----------------------------------------------------------------------
  // Derived helpers
  // -----------------------------------------------------------------------
  const localeTag = useMemo(() => {
    if (i18n.language === 'hi') return 'hi-IN';
    if (i18n.language === 'mr') return 'mr-IN';
    return 'en-IN';
  }, [i18n.language]);

  const formatDate = (ts: Timestamp | null | undefined): string => {
    if (!ts?.toDate) return '—';
    return ts.toDate().toLocaleDateString(localeTag, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------
  const healthTone = (status: HealthStatus): 'success' | 'leaf' | 'danger' => {
    if (status === 'excellent') return 'success';
    if (status === 'good') return 'leaf';
    return 'danger';
  };

  const nutrientTone = (level: NutrientLevel): 'success' | 'leaf' | 'danger' => {
    if (level === 'optimal') return 'success';
    if (level === 'high') return 'leaf';
    return 'danger';
  };

  // -----------------------------------------------------------------------
  // Login gate
  // -----------------------------------------------------------------------
  if (!user) {
    return (
      <Page>
        <PageHeader
          title={t('soil.title')}
          description={t('soil.subtitle')}
        />
        <Card>
          <EmptyState
            icon={<Sprout className="w-6 h-6" />}
            title={t('soil.loginRequired')}
            action={
              <Button variant="primary" onClick={() => navigate('/login')}>
                {t('soil.loginButton')}
              </Button>
            }
          />
        </Card>
      </Page>
    );
  }

  // -----------------------------------------------------------------------
  // Main render
  // -----------------------------------------------------------------------
  return (
    <Page>
      <PageHeader
        eyebrow={t('soil.summary')}
        title={t('soil.title')}
        description={t('soil.subtitle')}
        actions={
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(true)}
          >
            {t('soil.newTest')}
          </Button>
        }
      />

      {/* New test form */}
      <Modal
        open={showForm}
        onClose={() => {
          if (submitting) return;
          setShowForm(false);
          resetForm();
        }}
        title={t('soil.newTest')}
        description={t('soil.newTestDescription')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label={t('soil.fieldName')}
            htmlFor="soil-field-name"
            hint={t('soil.fieldNamePlaceholder')}
            error={errors.fieldName}
          >
            <Input
              id="soil-field-name"
              value={form.fieldName}
              onChange={handleChange('fieldName')}
              placeholder={t('soil.fieldNamePlaceholder')}
              maxLength={80}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t('soil.ph')}
              htmlFor="soil-ph"
              hint={t('soil.phHint')}
              error={errors.ph}
              required
            >
              <Input
                id="soil-ph"
                type="number"
                inputMode="decimal"
                step="0.1"
                min={0}
                max={14}
                value={form.ph}
                onChange={handleChange('ph')}
                placeholder="6.5"
                invalid={Boolean(errors.ph)}
                required
              />
            </FormField>

            <FormField
              label={t('soil.organicCarbon')}
              htmlFor="soil-oc"
              hint={t('soil.organicCarbonHint')}
              error={errors.organicCarbon}
              required
            >
              <Input
                id="soil-oc"
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                max={100}
                value={form.organicCarbon}
                onChange={handleChange('organicCarbon')}
                placeholder="0.5"
                invalid={Boolean(errors.organicCarbon)}
                required
              />
            </FormField>

            <FormField
              label={t('soil.nitrogen')}
              htmlFor="soil-n"
              hint={t('soil.nitrogenHint')}
              error={errors.nitrogen}
              required
            >
              <Input
                id="soil-n"
                type="number"
                inputMode="decimal"
                step="1"
                min={0}
                value={form.nitrogen}
                onChange={handleChange('nitrogen')}
                placeholder="280"
                invalid={Boolean(errors.nitrogen)}
                required
              />
            </FormField>

            <FormField
              label={t('soil.phosphorus')}
              htmlFor="soil-p"
              hint={t('soil.phosphorusHint')}
              error={errors.phosphorus}
              required
            >
              <Input
                id="soil-p"
                type="number"
                inputMode="decimal"
                step="1"
                min={0}
                value={form.phosphorus}
                onChange={handleChange('phosphorus')}
                placeholder="22"
                invalid={Boolean(errors.phosphorus)}
                required
              />
            </FormField>

            <FormField
              label={t('soil.potassium')}
              htmlFor="soil-k"
              hint={t('soil.potassiumHint')}
              error={errors.potassium}
              required
            >
              <Input
                id="soil-k"
                type="number"
                inputMode="decimal"
                step="1"
                min={0}
                value={form.potassium}
                onChange={handleChange('potassium')}
                placeholder="140"
                invalid={Boolean(errors.potassium)}
                required
              />
            </FormField>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (submitting) return;
                setShowForm(false);
                resetForm();
              }}
              disabled={submitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {submitting ? t('soil.submitting') : t('soil.submit')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => {
          if (deletingId) return;
          setConfirmDelete(null);
        }}
        title={t('soil.deleteConfirmTitle')}
        description={t('soil.deleteConfirmBody')}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(null)}
              disabled={Boolean(deletingId)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              loading={Boolean(deletingId)}
            >
              {t('soil.delete')}
            </Button>
          </>
        }
      />

      {/* Tests list */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-strong">
            {t('soil.previousTests')}
          </h2>
          {!isLowBandwidthMode && tests.length > 0 && (
            <Badge tone="soil" dot>
              {tests.length}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[0, 1].map((i) => (
              <Card key={i}>
                <Skeleton height={20} width="40%" />
                <div className="mt-3 space-y-2">
                  <Skeleton height={12} />
                  <Skeleton height={12} width="80%" />
                </div>
              </Card>
            ))}
          </div>
        ) : tests.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Droplet className="w-6 h-6" />}
              title={t('soil.noTestsTitle')}
              description={t('soil.noTestsDescription')}
              action={
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowForm(true)}
                >
                  {t('soil.runFirstTest')}
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => {
              const phLevel = classifyPh(test.ph);
              const nLevel = classifyNutrient(test.nitrogen, 280);
              const pLevel = classifyNutrient(test.phosphorus, 22);
              const kLevel = classifyNutrient(test.potassium, 140);
              const ocOk = test.organicCarbon >= 0.5;
              const health = computeHealth(
                test.ph,
                test.nitrogen,
                test.phosphorus,
                test.potassium,
                test.organicCarbon,
              );
              const recs = buildRecommendations(
                test.ph,
                test.nitrogen,
                test.phosphorus,
                test.potassium,
                test.organicCarbon,
                t,
              );

              return (
                <Card key={test.id} padded>
                  <CardHeader
                    title={
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-soil-600 flex-shrink-0" />
                        <span className="truncate">
                          {test.fieldName || t('soil.untitled')}
                        </span>
                      </span>
                    }
                    description={t('soil.testDate') + ': ' + formatDate(test.createdAt)}
                    action={
                      <div className="flex items-center gap-2">
                        <Badge tone={healthTone(health)} dot>
                          {t(`soil.health.${health}`)}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Share2 className="w-4 h-4" />}
                          onClick={() => handleShare(test)}
                          aria-label={t('soil.share')}
                        >
                          <span className="hidden sm:inline">{t('soil.share')}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          onClick={() => setConfirmDelete(test)}
                          aria-label={t('soil.delete')}
                        >
                          <span className="hidden sm:inline">{t('soil.delete')}</span>
                        </Button>
                      </div>
                    }
                  />

                  {/* pH bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-strong">
                        {t('soil.phValue')}
                      </span>
                      <span className="text-xl font-bold text-strong">
                        {test.ph.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-sunken rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          phLevel === 'optimal'
                            ? 'bg-success-500'
                            : phLevel === 'low'
                            ? 'bg-danger-500'
                            : 'bg-harvest-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, (test.ph / 14) * 100))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted mt-1.5">
                      <span>{t('soil.phScaleLow')}</span>
                      <span>{t('soil.phScaleMid')}</span>
                      <span>{t('soil.phScaleHigh')}</span>
                    </div>
                  </div>

                  {/* NPK + OC grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                    <NutrientTile
                      label={t('soil.nitrogen')}
                      value={`${test.nitrogen} mg/kg`}
                      level={nLevel}
                      levelLabel={t(`soil.nutrient.${nLevel}`)}
                      tone={nutrientTone(nLevel)}
                    />
                    <NutrientTile
                      label={t('soil.phosphorus')}
                      value={`${test.phosphorus} mg/kg`}
                      level={pLevel}
                      levelLabel={t(`soil.nutrient.${pLevel}`)}
                      tone={nutrientTone(pLevel)}
                    />
                    <NutrientTile
                      label={t('soil.potassium')}
                      value={`${test.potassium} mg/kg`}
                      level={kLevel}
                      levelLabel={t(`soil.nutrient.${kLevel}`)}
                      tone={nutrientTone(kLevel)}
                    />
                    <div
                      className={`rounded-lg border p-3 ${
                        ocOk
                          ? 'border-success-200 bg-success-50 text-strong'
                          : 'border-harvest-200 bg-harvest-50 text-strong'
                      }`}
                    >
                      <div className="text-xs font-medium text-muted">
                        {t('soil.organicCarbon')}
                      </div>
                      <div className="text-lg font-semibold mt-0.5">
                        {test.organicCarbon.toFixed(2)}%
                      </div>
                      <div className="text-xs mt-1 flex items-center gap-1">
                        {ocOk ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t('soil.ocGood')}</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{t('soil.ocLow')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="rounded-lg border border-subtle bg-canvas p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sprout className="w-4 h-4 text-leaf-600" />
                      <h3 className="text-sm font-semibold text-strong">
                        {t('soil.recommendations')}
                      </h3>
                    </div>
                    <ul className="space-y-1.5">
                      {recs.map((rec, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted flex items-start gap-2"
                        >
                          <span className="text-leaf-600 mt-0.5 select-none">•</span>
                          <span className="flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Tips card */}
      <Card className="mt-6" padded>
        <h3 className="text-base font-semibold text-strong mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-leaf-600" />
          {t('soil.tips.title')}
        </h3>
        <ul className="space-y-1.5 text-sm text-muted">
          {((t('soil.tips.items', { returnObjects: true }) as unknown) as string[]).map(
            (item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-leaf-600 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ),
          )}
        </ul>
      </Card>
    </Page>
  );
};

// ---------------------------------------------------------------------------
// Local subcomponent: nutrient tile
// ---------------------------------------------------------------------------
interface NutrientTileProps {
  label: string;
  value: string;
  level: NutrientLevel;
  levelLabel: string;
  tone: 'success' | 'leaf' | 'danger';
}

const NutrientTile: React.FC<NutrientTileProps> = ({
  label,
  value,
  level,
  levelLabel,
  tone,
}) => {
  const toneClass =
    tone === 'success'
      ? 'border-success-200 bg-success-50'
      : tone === 'leaf'
      ? 'border-leaf-200 bg-leaf-50'
      : 'border-danger-200 bg-danger-50';
  const Icon = level === 'low' ? AlertTriangle : level === 'high' ? TrendingUp : CheckCircle2;
  const iconColor =
    tone === 'success'
      ? 'text-success-600'
      : tone === 'leaf'
      ? 'text-leaf-600'
      : 'text-danger-600';

  return (
    <div className={`rounded-lg border p-3 ${toneClass}`}>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="text-lg font-semibold text-strong mt-0.5">{value}</div>
      <div className={`text-xs mt-1 flex items-center gap-1 ${iconColor}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{levelLabel}</span>
      </div>
    </div>
  );
};

export default SoilTesting;
