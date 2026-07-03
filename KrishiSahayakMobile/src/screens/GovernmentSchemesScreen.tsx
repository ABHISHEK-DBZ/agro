// Government Schemes Screen — Complete bilingual scheme information
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Header } from '../components';
import { Badge } from '../components/ui';

interface Scheme {
  id: string;
  name: string;
  nameHindi: string;
  description: string;
  descriptionHindi: string;
  benefits: string[];
  benefitsHindi: string[];
  eligibility: string[];
  eligibilityHindi: string[];
  documents: string[];
  documentsHindi: string[];
  applicationProcess: string[];
  applicationProcessHindi: string[];
  subsidy: string;
  subsidyHindi: string;
  category: 'Direct Benefit' | 'Soil Management' | 'Insurance' | 'Credit' | 'Infrastructure';
  status: 'active' | 'upcoming';
  link: string;
  icon: string;
}

const SCHEMES_DATA: Scheme[] = [
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    nameHindi: 'प्रधानमंत्री किसान सम्मान निधि',
    description: 'A central sector scheme providing income support of ₹6,000 per year in three equal installments to all landholding farmer families, directly transferred to bank accounts.',
    descriptionHindi: 'एक केंद्रीय क्षेत्र की योजना जो सभी भूमिधारक किसान परिवारों को तीन समान किस्तों में प्रति वर्ष ₹6,000 की आय सहायता प्रदान करती है, सीधे बैंक खातों में स्थानांतरित की जाती है।',
    benefits: ['₹6,000 per year in 3 installments', 'Direct Benefit Transfer (DBT) to bank account', 'Financial support for small & marginal farmers', 'No middlemen — direct to farmer'],
    benefitsHindi: ['3 किस्तों में प्रति वर्ष ₹6,000', 'बैंक खाते में प्रत्यक्ष लाभ हस्तांतरण (DBT)', 'छोटे और सीमांत किसानों के लिए वित्तीय सहायता', 'कोई बिचौलिया नहीं — सीधे किसान तक'],
    eligibility: ['All landholding farmer families', 'Must have cultivable land in name', 'Aadhaar card is mandatory', 'Bank account linked to Aadhaar'],
    eligibilityHindi: ['सभी भूमिधारक किसान परिवार', 'नाम पर खेती योग्य भूमि होनी चाहिए', 'आधार कार्ड अनिवार्य है', 'आधार से जुड़ा बैंक खाता'],
    documents: ['Aadhaar Card', 'Land ownership documents (Khasra/Khatauni)', 'Bank account passbook', 'Mobile number'],
    documentsHindi: ['आधार कार्ड', 'भूमि स्वामित्व दस्तावेज (खसरा/खतौनी)', 'बैंक खाता पासबुक', 'मोबाइल नंबर'],
    applicationProcess: ['Online registration on PM-KISAN portal', 'Through Common Service Centers (CSC)', 'State-designated nodal officers', 'Verify details at local patwari office'],
    applicationProcessHindi: ['पीएम-किसान पोर्टल पर ऑनलाइन पंजीकरण', 'कॉमन सर्विस सेंटर (सीएससी) के माध्यम से', 'राज्य-नामित नोडल अधिकारी', 'स्थानीय पटवारी कार्यालय में विवरण सत्यापित करें'],
    subsidy: '₹6,000/year per family',
    subsidyHindi: '₹6,000/वर्ष प्रति परिवार',
    category: 'Direct Benefit',
    status: 'active',
    link: 'https://pmkisan.gov.in',
    icon: '💰',
  },
  {
    id: 'soilhealth',
    name: 'Soil Health Card',
    nameHindi: 'मृदा स्वास्थ्य कार्ड योजना',
    description: 'Provides farmers with a Soil Health Card containing nutrient status of their soil and recommendations on appropriate fertilizer dosage for improving soil health and fertility.',
    descriptionHindi: 'किसानों को उनकी मिट्टी की पोषक स्थिति और मिट्टी के स्वास्थ्य और उर्वरता में सुधार के लिए उर्वरक की उचित खुराक पर सिफारिशों वाला मृदा स्वास्थ्य कार्ड प्रदान करती है।',
    benefits: ['Scientific fertilizer application', 'Reduces cultivation cost by 20-30%', 'Improves crop yield', 'Free soil testing every 2 years'],
    benefitsHindi: ['वैज्ञानिक उर्वरक प्रयोग', 'खेती की लागत को 20-30% कम करता है', 'फसल की उपज में सुधार', 'हर 2 साल में मुफ्त मृदा परीक्षण'],
    eligibility: ['All farmers are eligible', 'Soil sample from own field required'],
    eligibilityHindi: ['सभी किसान पात्र हैं', 'अपने खेत से मिट्टी का नमूना आवश्यक'],
    documents: ['Land records', 'Aadhaar card', 'Basic identification'],
    documentsHindi: ['भूमि रिकॉर्ड', 'आधार कार्ड', 'बुनियादी पहचान'],
    applicationProcess: ['Contact local agriculture office or KVK', 'Soil sample collected by trained personnel', 'Sample tested at lab', 'Card delivered within 2 weeks'],
    applicationProcessHindi: ['स्थानीय कृषि कार्यालय या KVK से संपर्क करें', 'प्रशिक्षित कर्मियों द्वारा मिट्टी का नमूना लिया जाता है', 'प्रयोगशाला में नमूने का परीक्षण', '2 सप्ताह के भीतर कार्ड वितरित'],
    subsidy: 'Free soil testing & card',
    subsidyHindi: 'मुफ्त मृदा परीक्षण और कार्ड',
    category: 'Soil Management',
    status: 'active',
    link: 'https://soilhealth.dac.gov.in',
    icon: '🌱',
  },
  {
    id: 'pmfby',
    name: 'PMFBY',
    nameHindi: 'प्रधानमंत्री फसल बीमा योजना',
    description: 'Pradhan Mantri Fasal Bima Yojana provides comprehensive crop insurance against natural calamities, with very low premium rates for farmers.',
    descriptionHindi: 'प्रधानमंत्री फसल बीमा योजना प्राकृतिक आपदाओं के खिलाफ किसानों को बहुत कम प्रीमियम दरों पर व्यापक फसल बीमा प्रदान करती है।',
    benefits: ['Comprehensive risk coverage for all stages', 'Low premium: 2% Kharif, 1.5% Rabi, 5% commercial', 'Technology-driven loss assessment', 'Timely claim settlement within 2 months'],
    benefitsHindi: ['सभी चरणों के लिए व्यापक जोखिम कवरेज', 'कम प्रीमियम: खरीफ 2%, रबी 1.5%, व्यावसायिक 5%', 'प्रौद्योगिकी आधारित नुकसान मूल्यांकन', '2 महीने के भीतर समय पर दावा निपटान'],
    eligibility: ['All farmers including sharecroppers', 'Must have insurable crop', 'Loanee farmers: compulsory', 'Non-loanee: voluntary'],
    eligibilityHindi: ['बटाईदारों सहित सभी किसान', 'बीमा योग्य फसल होनी चाहिए', 'ऋणी किसान: अनिवार्य', 'गैर-ऋणी: स्वैच्छिक'],
    documents: ['Land records', 'Sowing certificate', 'Bank account details', 'Crop details'],
    documentsHindi: ['भूमि रिकॉर्ड', 'बुवाई प्रमाण पत्र', 'बैंक खाते का विवरण', 'फसल विवरण'],
    applicationProcess: ['Through banks or CSCs', 'National Crop Insurance Portal (ncip.in)', 'Enrollment before sowing deadline', 'Claims through insurance company'],
    applicationProcessHindi: ['बैंकों या CSC के माध्यम से', 'राष्ट्रीय फसल बीमा पोर्टल (ncip.in)', 'बुवाई की समय सीमा से पहले नामांकन', 'बीमा कंपनी के माध्यम से दावे'],
    subsidy: 'Premium: 2% Kharif, 1.5% Rabi',
    subsidyHindi: 'प्रीमियम: खरीफ 2%, रबी 1.5%',
    category: 'Insurance',
    status: 'active',
    link: 'https://pmfby.gov.in',
    icon: '🛡️',
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC)',
    nameHindi: 'किसान क्रेडिट कार्ड',
    description: 'Provides farmers with timely and adequate credit for cultivation, post-harvest expenses, and other needs through a single window with flexible procedures.',
    descriptionHindi: 'किसानों को लचीली प्रक्रियाओं के साथ एकल खिड़की के माध्यम से खेती, कटाई के बाद के खर्चों और अन्य जरूरतों के लिए समय पर और पर्याप्त ऋण प्रदान करता है।',
    benefits: ['Credit up to ₹3 lakh at 7% interest', '4% interest with timely repayment (2% subvention + 1% prompt)', 'Personal accident cover of ₹50,000', 'Flexible withdrawal — use as needed'],
    benefitsHindi: ['7% ब्याज पर ₹3 लाख तक ऋण', 'समय पर भुगतान पर 4% ब्याज', '₹50,000 का व्यक्तिगत दुर्घटना कवर', 'लचीली निकासी — आवश्यकतानुसार उपयोग'],
    eligibility: ['All farmers — individual/joint', 'Tenant farmers', 'Oral lessees & sharecroppers', 'Joint Liability Groups (JLGs)'],
    eligibilityHindi: ['सभी किसान — व्यक्तिगत/संयुक्त', 'किरायेदार किसान', 'मौखिक पट्टेदार और बटाईदार', 'संयुक्त देयता समूह (JLG)'],
    documents: ['Identity & address proof (Aadhaar)', 'Land documents', 'Passport size photo', 'Crop plan / farm details'],
    documentsHindi: ['पहचान और पते का प्रमाण (आधार)', 'भूमि दस्तावेज', 'पासपोर्ट आकार का फोटो', 'फसल योजना / खेत विवरण'],
    applicationProcess: ['Visit any bank branch', 'Fill KCC application form', 'Submit documents for verification', 'Card issued within 2-4 weeks'],
    applicationProcessHindi: ['किसी भी बैंक शाखा में जाएं', 'KCC आवेदन पत्र भरें', 'सत्यापन के लिए दस्तावेज जमा करें', '2-4 सप्ताह में कार्ड जारी'],
    subsidy: '7% interest (4% with timely payment)',
    subsidyHindi: '7% ब्याज (समय पर भुगतान पर 4%)',
    category: 'Credit',
    status: 'active',
    link: 'https://www.sbi.co.in/web/agri-rural/agriculture-banking/crop-finance/kisan-credit-card-kcc',
    icon: '💳',
  },
  {
    id: 'pmfme',
    name: 'PMFME',
    nameHindi: 'प्रधानमंत्री सूक्ष्म खाद्य प्रसंस्करण उद्योग योजना',
    description: 'PM Formalisation of Micro Food Processing Enterprises scheme aims to enhance the competitiveness of existing micro food processing enterprises and promote formalisation.',
    descriptionHindi: 'सूक्ष्म खाद्य प्रसंस्करण उद्यमों को औपचारिक बनाने की योजना मौजूदा सूक्ष्म खाद्य प्रसंस्करण उद्यमों की प्रतिस्पर्धात्मकता बढ़ाने और औपचारिकता को बढ़ावा देने का लक्ष्य रखती है।',
    benefits: ['Credit-linked grant up to ₹10 lakh', 'Seed capital of ₹40,000 for SHG members', 'Technical & business mentoring', 'Branding & marketing support'],
    benefitsHindi: ['₹10 लाख तक का ऋण-लिंक्ड अनुदान', 'SHG सदस्यों के लिए ₹40,000 की बीज पूंजी', 'तकनीकी और व्यावसायिक मार्गदर्शन', 'ब्रांडिंग और विपणन सहायता'],
    eligibility: ['Individual micro food processors', 'FPOs, SHGs, cooperatives', 'Must have FSSAI registration', 'Existing food processing units'],
    eligibilityHindi: ['व्यक्तिगत सूक्ष्म खाद्य प्रसंस्करणकर्ता', 'FPO, SHG, सहकारी समितियां', 'FSSAI पंजीकरण होना चाहिए', 'मौजूदा खाद्य प्रसंस्करण इकाइयां'],
    documents: ['Aadhaar', 'FSSAI Registration', 'Project report', 'Bank account details'],
    documentsHindi: ['आधार', 'FSSAI पंजीकरण', 'परियोजना रिपोर्ट', 'बैंक खाते का विवरण'],
    applicationProcess: ['Apply through State Nodal Agency', 'Submit project proposal', 'Technical committee evaluation', 'Grant disbursement in tranches'],
    applicationProcessHindi: ['राज्य नोडल एजेंसी के माध्यम से आवेदन करें', 'परियोजना प्रस्ताव प्रस्तुत करें', 'तकनीकी समिति मूल्यांकन', 'किश्तों में अनुदान वितरण'],
    subsidy: 'Up to ₹10 lakh credit-linked grant',
    subsidyHindi: '₹10 लाख तक का ऋण-लिंक्ड अनुदान',
    category: 'Direct Benefit',
    status: 'active',
    link: 'https://pmfme.mofpi.gov.in',
    icon: '🏭',
  },
];

const CATEGORIES = ['All', 'Direct Benefit', 'Soil Management', 'Insurance', 'Credit', 'Infrastructure'];

export const GovernmentSchemesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  const filtered = useMemo(() => {
    let list = SCHEMES_DATA;
    if (selectedCategory !== 'All') {
      list = list.filter(s => s.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.nameHindi.includes(q) ||
        (lang === 'hi' ? s.descriptionHindi : s.description).toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, search, lang]);

  return (
    <View style={styles.container}>
      <Header
        title={lang === 'en' ? 'Government Schemes' : 'सरकारी योजनाएं'}
        subtitle={`${filtered.length} ${lang === 'en' ? 'schemes available' : 'योजनाएं उपलब्ध'}`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={() => setLang(lang === 'en' ? 'hi' : 'en')} style={styles.langToggle}>
            <Text style={styles.langText}>{lang === 'en' ? 'हिंदी' : 'English'}</Text>
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={lang === 'en' ? 'Search schemes...' : 'योजनाएं खोजें...'}
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Chips */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={i => i}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedCategory === item && styles.chipActive]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.chipText, selectedCategory === item && styles.chipTextActive]}>
                {item === 'All' ? (lang === 'en' ? 'All' : 'सभी') :
                 item === 'Direct Benefit' ? (lang === 'en' ? 'Direct Benefit' : 'प्रत्यक्ष लाभ') :
                 item === 'Soil Management' ? (lang === 'en' ? 'Soil Mgmt' : 'मृदा प्रबंधन') :
                 item === 'Insurance' ? (lang === 'en' ? 'Insurance' : 'बीमा') :
                 item === 'Credit' ? (lang === 'en' ? 'Credit' : 'ऋण') : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedScheme(item)} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{lang === 'en' ? item.name : item.nameHindi}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </View>
              <Badge
                label={item.status === 'active' ? (lang === 'en' ? 'Active' : 'सक्रिय') : (lang === 'en' ? 'Upcoming' : 'आगामी')}
                variant={item.status === 'active' ? 'success' : 'info'}
                size="sm"
              />
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>
              {lang === 'en' ? item.description : item.descriptionHindi}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.subsidy}>
                {lang === 'en' ? '💰 ' : '💰 '}{lang === 'en' ? item.subsidy : item.subsidyHindi}
              </Text>
              <Text style={styles.viewMore}>{lang === 'en' ? 'Details →' : 'विवरण →'}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>{lang === 'en' ? 'No schemes found' : 'कोई योजना नहीं मिली'}</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedScheme} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedScheme && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {lang === 'en' ? selectedScheme.name : selectedScheme.nameHindi}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedScheme(null)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalIconRow}>
                    <Text style={styles.modalIcon}>{selectedScheme.icon}</Text>
                    <Badge label={selectedScheme.category} variant="info" size="sm" />
                    <Badge
                      label={selectedScheme.status === 'active' ? (lang === 'en' ? 'Active' : 'सक्रिय') : 'Upcoming'}
                      variant={selectedScheme.status === 'active' ? 'success' : 'info'}
                      size="sm"
                    />
                  </View>

                  <Text style={styles.modalDesc}>
                    {lang === 'en' ? selectedScheme.description : selectedScheme.descriptionHindi}
                  </Text>

                  <DetailSection
                    title={lang === 'en' ? '✅ Benefits' : '✅ लाभ'}
                    items={lang === 'en' ? selectedScheme.benefits : selectedScheme.benefitsHindi}
                  />
                  <DetailSection
                    title={lang === 'en' ? '👤 Eligibility' : '👤 पात्रता'}
                    items={lang === 'en' ? selectedScheme.eligibility : selectedScheme.eligibilityHindi}
                  />
                  <DetailSection
                    title={lang === 'en' ? '📄 Documents Needed' : '📄 आवश्यक दस्तावेज'}
                    items={lang === 'en' ? selectedScheme.documents : selectedScheme.documentsHindi}
                  />
                  <DetailSection
                    title={lang === 'en' ? '📝 How to Apply' : '📝 आवेदन कैसे करें'}
                    items={lang === 'en' ? selectedScheme.applicationProcess : selectedScheme.applicationProcessHindi}
                  />

                  <View style={styles.modalSubsidy}>
                    <Text style={styles.modalSubsidyLabel}>
                      {lang === 'en' ? '💰 Subsidy / Benefit:' : '💰 सब्सिडी / लाभ:'}
                    </Text>
                    <Text style={styles.modalSubsidyValue}>
                      {lang === 'en' ? selectedScheme.subsidy : selectedScheme.subsidyHindi}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const DetailSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <View style={styles.detailSection}>
    <Text style={styles.detailTitle}>{title}</Text>
    {items.map((item, i) => (
      <View key={i} style={styles.detailItem}>
        <Text style={styles.detailBullet}>•</Text>
        <Text style={styles.detailText}>{item}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  langToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  langText: { fontSize: typography.fontSize.xs, color: colors.textInverse, fontWeight: typography.fontWeight.semibold },
  searchContainer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.fontSize.md, color: colors.textPrimary },
  categoryRow: { paddingVertical: spacing.sm, paddingLeft: spacing.lg, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.background, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primaryFaded, borderColor: colors.primary },
  chipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  list: { padding: spacing.lg, paddingBottom: spacing.huge },
  card: { backgroundColor: colors.white, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  cardIcon: { fontSize: 28, marginRight: spacing.md },
  cardInfo: { flex: 1 },
  cardName: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.textPrimary },
  cardCategory: { fontSize: typography.fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  cardDesc: { fontSize: typography.fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.md },
  subsidy: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: typography.fontWeight.semibold },
  viewMore: { fontSize: typography.fontSize.sm, color: colors.info, fontWeight: typography.fontWeight.medium },
  empty: { alignItems: 'center', padding: spacing.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, color: colors.textSecondary },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: borderRadius.xl, borderTopRightRadius: borderRadius.xl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, flex: 1, marginRight: spacing.md },
  modalClose: { fontSize: typography.fontSize.xl, color: colors.textTertiary, padding: spacing.xs },
  modalBody: { padding: spacing.xl },
  modalIconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  modalIcon: { fontSize: 32 },
  modalDesc: { fontSize: typography.fontSize.md, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.lg },
  detailSection: { marginBottom: spacing.lg },
  detailTitle: { fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.bold, color: colors.textPrimary, marginBottom: spacing.sm },
  detailItem: { flexDirection: 'row', marginBottom: spacing.xs, paddingLeft: spacing.sm },
  detailBullet: { fontSize: typography.fontSize.md, color: colors.primary, marginRight: spacing.sm, lineHeight: 20 },
  detailText: { fontSize: typography.fontSize.sm, color: colors.textSecondary, flex: 1, lineHeight: 20 },
  modalSubsidy: { backgroundColor: colors.primaryFaded, padding: spacing.lg, borderRadius: borderRadius.md, marginTop: spacing.sm, marginBottom: spacing.xxl },
  modalSubsidyLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: colors.primary, marginBottom: spacing.xs },
  modalSubsidyValue: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.primaryDark },
});

export default GovernmentSchemesScreen;
