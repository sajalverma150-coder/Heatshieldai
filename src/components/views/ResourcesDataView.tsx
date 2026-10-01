import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Code2,
  Database,
  CheckCircle2,
  BookOpen,
  Layers,
  FileSpreadsheet,
  HardHat,
  Stethoscope,
  ShieldAlert,
  Clock,
  Eye,
  Copy,
  Check,
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { LanguageCode } from '../../types';
import { PolicyDocument, PolicyDocumentViewerModal } from '../modals/PolicyDocumentViewerModal';

interface ResourcesDataViewProps {
  language: LanguageCode;
}

export const ResourcesDataView: React.FC<ResourcesDataViewProps> = ({ language }) => {
  const isHindi = language === 'hi';
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'workplace' | 'clinical' | 'hap' | 'meteorological'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [expandedApiIdx, setExpandedApiIdx] = useState<number | null>(null);

  // Mini formula test calculator state
  const [calcTemp, setCalcTemp] = useState<number>(42);
  const [calcHumidity, setCalcHumidity] = useState<number>(45);
  const [calcSolar, setCalcSolar] = useState<number>(850);
  const [isFormulaCalculatorOpen, setIsFormulaCalculatorOpen] = useState<boolean>(false);

  // Compute live approximate formula values
  const computeQuickHeatIndex = (T: number, R: number) => {
    // Steadman polynomial approximation in Celsius
    const T_F = (T * 9) / 5 + 32;
    const hi_F = -42.379 + 2.04901523 * T_F + 10.14333127 * R - 0.22475541 * T_F * R 
      - 0.00683783 * T_F * T_F - 0.05481717 * R * R + 0.00122874 * T_F * T_F * R 
      + 0.00085282 * T_F * R * R - 0.00000199 * T_F * T_F * R * R;
    const hi_C = ((hi_F - 32) * 5) / 9;
    return Number(hi_C.toFixed(1));
  };

  const computeQuickWBGT = (T: number, R: number, solar: number) => {
    // Simplified Liljegren approximation outdoor WBGT
    const Tw = T * Math.atan(0.151977 * Math.pow(R + 8.313659, 0.5)) + Math.atan(T + R) - Math.atan(R - 1.676331) + 0.00391838 * Math.pow(R, 1.5) * Math.atan(0.023101 * R) - 4.686035;
    const Tg = T + (solar / 1000) * 12; // Globe temperature estimate with solar radiation
    const wbgt = 0.7 * Tw + 0.2 * Tg + 0.1 * T;
    return Number(wbgt.toFixed(1));
  };

  const liveHI = computeQuickHeatIndex(calcTemp, calcHumidity);
  const liveWBGT = computeQuickWBGT(calcTemp, calcHumidity, calcSolar);

  // Full official policy documents with approved frameworks
  const policyDocuments: PolicyDocument[] = [
    {
      id: 'dgfasli-workplace-heat-curfew',
      title: 'Workplace Heat Stress Assessment, Permissible Exposure Limits & Outdoor Curfews (ISO 7243:2017)',
      agency: 'Directorate General Factory Advice Service and Labour Institutes (DGFASLI)',
      ministry: 'Ministry of Labour & Employment, Govt of India',
      year: '2026 Statutory Framework',
      fileSize: '3.1 MB PDF',
      category: 'workplace',
      gazetteRef: 'DGFASLI/OSH/2026/CIR-14',
      executiveSummary: 'Statutory occupational safety standards mandating immediate cessation of heavy physical labor during extreme heat hours, establishment of cool recovery rooms, minimum chilled water distribution, and strict work-rest ratios under the Factories Act, 1948.',
      keyCurfewProtocols: {
        title: 'Mandatory Workplace Curfew & Labor Stoppage Protocol',
        details: 'Mandatory prohibition of all non-essential outdoor physical labor (including construction, stone quarries, surface mining, brick kilns, and roadside paving) between 12:00 PM and 03:30 PM whenever ambient dry-bulb temperature exceeds 40.0°C or localized WBGT exceeds 31.0°C. Shifts must be rescheduled to cooler morning (06:00-11:00 AM) and evening (04:00-07:30 PM) windows without reducing statutory daily wages.',
        threshold: 'Ambient Air Temp ≥ 40°C OR WBGT ≥ 31.0°C',
        penalty: 'Offense punishable under Section 92 of Factories Act 1948 and Section 51 of Disaster Management Act (fine up to ₹1,00,000 / 2 years imprisonment).'
      },
      statutoryMandates: [
        'Mandatory provision of minimum 3 to 5 Liters of certified potable chilled water (≤ 15°C) and free Oral Rehydration Salts (ORS) per worker per shift.',
        'On-site shaded recovery stations with evaporative cooling or misting fans within 50 meters of every active outdoor work point.',
        'Work-Rest Regimens: WBGT 28.0–29.9°C: 75% work / 25% rest; WBGT 30.0–31.4°C: 50% work / 50% rest; WBGT 31.5–32.4°C: 25% work / 75% rest; WBGT ≥ 32.5°C: Total labor stoppage.',
        'Designation of a certified trained Heat Safety Marshal on all construction sites employing 20 or more outdoor workers.',
        'Immediate employer liability to provide emergency transport to nearest accredited hospital in case of worker heat exhaustion or stroke.'
      ],
      operationalChecklist: [
        'Inspect work site drinking water points at 08:00 AM and 01:00 PM daily.',
        'Ensure mandatory 15-minute hydration whistle breaks every 60 minutes.',
        'Maintain daily on-site heat stress monitoring logs using calibrated WBGT meters.',
        'Provide breathable, high-visibility cotton protective headwear and neck shades.'
      ],
      fullTextContent: `NATIONAL OCCUPATIONAL SAFETY & HEALTH COUNCIL
DIRECTORATE GENERAL FACTORY ADVICE SERVICE & LABOUR INSTITUTES (DGFASLI)
CIRCULAR NO: DGFASLI/OSH/2026/CIR-14

SUBJECT: STATUTORY OCCUPATIONAL SAFETY GUIDELINES FOR PREVENTION OF HEAT ILLNESS AND MANDATORY CURFEW REGIMES FOR OUTDOOR WORKERS

1. STATUTORY AUTHORITY
Exercising powers conferred under the Factories Act, 1948, the Building and Other Construction Workers (BOCW) Act, 1996, and the Occupational Safety, Health and Working Conditions Code, 2020, all industrial and infrastructure employers across India are directed to implement these guidelines forthwith.

2. MANDATORY PEAK HEAT CURFEW (12:00 PM - 03:30 PM)
2.1. In any district where the India Meteorological Department (IMD) issues an Orange or Red Heatwave Alert, or where localized dry-bulb temperature exceeds 40.0°C, all outdoor physical labor MUST cease between 12:00 PM and 03:30 PM.
2.2. Work hours shall be shifted to 06:00 AM - 11:00 AM and 04:00 PM - 07:30 PM.
2.3. No employer shall deduct wages or extend weekly hours in violation of statutory labor norms.

3. MANDATORY HYDRATION & RECOVERY SHEDS
3.1. Employers shall provide at least 5 Liters of potable drinking water per worker per day, kept below 15°C.
3.2. Free government-approved ORS packets shall be distributed at the start of each shift.
3.3. Air-cooled or mist-fan equipped rest shelters must be situated within 50 meters of active work zones.

4. WORK-REST CYCLES (ISO 7243:2017)
- WBGT 28.0°C - 29.9°C: 45 min work / 15 min rest per hour
- WBGT 30.0°C - 31.4°C: 30 min work / 30 min rest per hour
- WBGT 31.5°C - 32.4°C: 15 min work / 45 min rest per hour
- WBGT >= 32.5°C: Complete stoppage of heavy/moderate physical labor

5. PENAL PROVISIONS
Failure to comply shall attract immediate prosecution under Section 92 of the Factories Act, 1948 and Section 51 of the Disaster Management Act, 2005.`
    },
    {
      id: 'ncdc-clinical-heat-protocol',
      title: 'National Centre for Disease Control (NCDC) Heat-Related Illness Surveillance & Clinical Triage Protocol',
      agency: 'National Centre for Disease Control (NCDC)',
      ministry: 'Ministry of Health & Family Welfare, Govt of India',
      year: '2026 Clinical Protocol',
      fileSize: '1.9 MB PDF',
      category: 'clinical',
      gazetteRef: 'NCDC/NPCCHH/2026/SOP-09',
      executiveSummary: 'National clinical management protocol for Emergency Departments, detailing early diagnosis of Exertional and Classic Heat Stroke, aggressive rapid cold water immersion, hemodynamic stabilization, and zero-denial triage directives.',
      clinicalAlgorithm: {
        emergencyTriage: 'Emergency Level 1 (Code Red) Triage for any patient presenting with Hyperpyrexia (Core temperature > 40.0°C / 104°F), central nervous system dysfunction (altered sensorium, delirium, seizures, coma), hot dry or sweat-soaked skin, and tachycardia/hypotension.',
        activeCooling: 'Immediate whole-body cold water immersion (tub filled with 1°C–14°C chilled water) or continuous ice-water misting combined with high-velocity cooling fans within the "Golden Hour". Pack crushed ice bags around axillae, groin, and neck adjacent to large vascular bundles. Target: Lower core body temperature to < 39.0°C (102.2°F) within 30 minutes.',
        fluids: 'Intravenous fluid resuscitation with isotonic Normal Saline (0.9% NaCl) or Ringer\'s Lactate at 20–30 mL/kg rapid infusion. Monitor central venous pressure, lungs for pulmonary rales, and maintain urinary output > 0.5 mL/kg/h.',
        contraindications: 'CRITICAL CONTRAINDICATION: Antipyretics (Paracetamol / Acetaminophen and Aspirin) are completely ineffective for environmental heat stroke and MUST NOT be given. They exacerbate acute hepatic necrosis and aggravate bleeding diatheses.'
      },
      statutoryMandates: [
        'Mandatory 24x7 operationalization of designated air-conditioned Heat Stroke Resuscitation Rooms in all District, Sub-divisional, and Community Health Centres.',
        'Zero-Denial Emergency Care: No hospital (government or private) may refuse emergency stabilization or admission to a heat stroke victim under emergency duty of care.',
        'Daily electronic reporting of all heat-related illnesses and fatalities into the Integrated Health Information Platform (IHIP) portal before 18:00 IST.',
        'Peripheral Primary Health Centres (PHCs) must maintain minimum buffer stocks of 500 ORS sachets, 200 IV fluid bags, and dedicated immersion tubs.'
      ],
      operationalChecklist: [
        'Verify ice production machines and cold water supply in emergency triage rooms.',
        'Check rectal thermometry probes for accurate core body temperature monitoring.',
        'Ensure continuous cardiac telemetry and pulse oximetry monitoring for severe cases.',
        'Stock emergency anticonvulsants (Lorazepam / Midazolam) for heat-induced status epilepticus.'
      ],
      fullTextContent: `NATIONAL CENTRE FOR DISEASE CONTROL (NCDC)
NATIONAL PROGRAMME ON CLIMATE CHANGE & HUMAN HEALTH (NPCCHH)
DOCUMENT REF: NCDC/NPCCHH/2026/SOP-09

SUBJECT: STANDARD CLINICAL OPERATING PROCEDURE FOR EMERGENCY ROOM TRIAGE AND RESUSCITATION OF HEAT STROKE CASES

1. DIAGNOSTIC CRITERIA FOR HEAT STROKE
- Core Body Temperature (Rectal): > 40.0°C (104.0°F)
- Central Nervous System (CNS) Dysfunction: Confusion, delirium, agitation, ataxia, seizures, or coma.
- Anhydrosis may be present in Classic Heat Stroke, but profuse diaphoresis is commonly seen in Exertional Heat Stroke.

2. IMMEDIATE "GOLDEN HOUR" INTERVENTIONS
2.1. AIRWAY, BREATHING, CIRCULATION: Secure airway, provide 100% high-flow oxygen via non-rebreather mask.
2.2. AGGRESSIVE ACTIVE COOLING:
- Immersion in ice-cold water (1°C to 14°C) is the gold standard method of cooling.
- If immersion is unavailable, evaporative cooling with continuous misting of lukewarm/cold water and high-speed fans must be initiated immediately.
- Place ice packs in axillae, groin, back of the neck, and forehead.
- STOP active cooling when core temperature reaches 38.8°C to 39.0°C to avoid rebound hypothermia.

3. HEMODYNAMIC RESUSCITATION
- 0.9% Normal Saline or Ringer's Lactate 1000 mL to 2000 mL IV bolus over the first hour.
- Avoid overhydration; monitor for pulmonary edema and acute right ventricular strain.

4. CONTRAINDICATIONS & WARNINGS
- DO NOT ADMINISTER ANTIPYRETICS (Paracetamol, Aspirin, NSAIDs). They do not reset the hypothalamic set point in environmental hyperthermia and can trigger severe fulminant hepatic failure and DIC.

5. MANDATORY REPORTING
All cases must be uploaded to the IHIP Heat-Related Illness portal daily by 18:00 IST.`
    },
    {
      id: 'ndma-heatwave-action-plan',
      title: 'National Guidelines for Preparation of Action Plan - Prevention and Management of Heat-Wave',
      agency: 'National Disaster Management Authority (NDMA)',
      ministry: 'Ministry of Home Affairs, Govt of India',
      year: '2026 Edition',
      fileSize: '4.2 MB PDF',
      category: 'hap',
      gazetteRef: 'NDMA/PR/2026/HW-01',
      executiveSummary: 'The definitive national master framework for state and district administrations to prepare, execute, and monitor Heat Action Plans (HAP), establishing inter-agency command structures and public warning dissemination.',
      statutoryMandates: [
        'Enforcement of 4-tier alert system: Green (Normal), Yellow (Watch), Orange (Be Prepared), and Red (Take Action).',
        'District Magistrates (DMs) designated as Incident Commanders with emergency powers under Disaster Management Act, 2005.',
        'Mandatory deployment of municipal water tankers to water-scarce informal settlements during Orange/Red alerts.',
        'Establishment of public cooling centers in community halls, libraries, and bus depots with free chilled water and air-cooling.',
        'Power utilities prohibited from executing scheduled maintenance outages between 10:00 AM and 05:00 PM during declared heatwaves.'
      ],
      operationalChecklist: [
        'Activate District Emergency Operations Center (DEOC) 24x7 control room.',
        'Disseminate cell-broadcast emergency alerts across all regional telecom towers.',
        'Coordinate municipal mobile medical vans to patrol high-risk transit hubs and slums.',
        'Inspect public water kiosks (piaus) and refill municipal cisterns twice daily.'
      ],
      fullTextContent: `NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
NATIONAL HEAT ACTION PLAN FRAMEWORK
EDITION: 2026 (REVISED MASTER FRAMEWORK)

1. STATUTORY BACKING
Prepared pursuant to Section 6(2)(i) of the Disaster Management Act, 2005.

2. FOUR-TIER HEAT ALERT CLASSIFICATION
- Green (Normal): Normal temperatures expected. Routine public education.
- Yellow (Be Updated): Heat conditions likely. Inter-agency alerts sent to hospitals, power utilities, and transport hubs.
- Orange (Be Prepared): Moderate to severe heatwave conditions lasting 2+ days. Workplace curfew activated from 12:00 PM to 03:30 PM. Cooling centers open.
- Red (Take Action): Extreme heatwave persisting > 4 days or temperatures > 45°C. Total mobilization of emergency teams, emergency cell broadcasts, and disaster relief funds.

3. ROLES OF NODAL DEPARTMENTS
- Revenue / Disaster Management: Overarching coordination through District Magistrates.
- Health Department: 24x7 heat stroke beds, dedicated ambulance routes, free ORS distribution.
- Municipal Corporation: Operation of Piaus (drinking water booths), misting stations in markets, mobile water tankers.
- Power DISCOMs: Uninterrupted electricity supply to hospitals and cooling centers.
- Labour Department: Strict enforcement of mandatory midday work stoppage.`
    },
    {
      id: 'imd-heatwave-sop-manual',
      title: 'Standard Operating Procedure (SOP) for Biometeorological Heat-Health Warning Services',
      agency: 'India Meteorological Department (IMD)',
      ministry: 'Ministry of Earth Sciences, Govt of India',
      year: 'Operational Manual v3.2',
      fileSize: '2.8 MB PDF',
      category: 'meteorological',
      gazetteRef: 'IMD/MET-HAP/2026/V3.2',
      executiveSummary: 'Technical meteorological guidelines defining quantitative criteria for Heat Waves, Severe Heat Waves, Wet Bulb Globe Temperature alerts, and daily issuance schedules for national early warning bulletins.',
      statutoryMandates: [
        'Heat Wave criteria: Plains max temperature ≥ 40.0°C or departure from normal ≥ 4.5°C; Coastal areas ≥ 37.0°C; Hills ≥ 30.0°C.',
        'Severe Heat Wave criteria: Departure from normal ≥ 6.5°C or actual maximum temperature ≥ 45.0°C.',
        'Daily issuance of 5-day district-level biometeorological risk bulletins at 08:30 IST and 16:30 IST.',
        'Integration with the Common Alerting Protocol (CAP-India) platform for automated multi-channel emergency broadcast.'
      ],
      operationalChecklist: [
        'Verify AWS telemetry feeds every 15 minutes for sensor drift or hardware failure.',
        'Run daily numerical weather prediction ensemble models (NCUM and GFS-T1534).',
        'Cross-verify satellite Land Surface Temperature (LST) anomalies from INSAT-3DR and MODIS.',
        'Issue immediate Special Weather Bulletins to NDMA, State SDMAs, and Chief Secretaries.'
      ],
      fullTextContent: `INDIA METEOROLOGICAL DEPARTMENT (IMD)
BIOMETEOROLOGICAL DIVISION
STANDARD OPERATING PROCEDURE (SOP) FOR HEAT-HEALTH WARNING SERVICES
VERSION: 3.2 (OPERATIONAL COMPENDIUM)

1. QUANTITATIVE CRITERIA FOR HEATWAVE IN INDIA
A. Based on Departure from Normal Temperature:
- Heat Wave: Departure from normal is 4.5°C to 6.4°C
- Severe Heat Wave: Departure from normal is >= 6.5°C

B. Based on Actual Maximum Temperature:
- Heat Wave: Maximum temperature reaches >= 40.0°C for Plains and >= 30.0°C for Hilly regions.
- Severe Heat Wave: Maximum temperature reaches >= 45.0°C (regardless of normal).

2. BIOMETEOROLOGICAL WBGT INDEX MONITORING
IMD integrates ambient dry-bulb temperature, relative humidity, wind speed, and solar radiation to compute the Wet Bulb Globe Temperature (WBGT) across 800+ Automatic Weather Stations.
- Yellow Alert: WBGT 28.0°C - 29.9°C
- Orange Alert: WBGT 30.0°C - 32.4°C
- Red Alert: WBGT >= 32.5°C

3. DISSEMINATION TIMELINE
- Morning Outlook: 08:30 IST
- Evening Detailed Bulletin: 16:30 IST
All alerts transmitted via CAP-India to NDMA, Telecom Service Providers, and State DEOCs.`
    },
  ];

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/v1/districts/heat-risk',
      desc: 'Retrieves all-India district thermal indices, WBGT, and current alert levels in JSON/GeoJSON.',
      sampleResponse: {
        timestamp: '2026-09-12T10:30:00Z',
        source: 'IMD-AWS-National-Feed',
        total_districts_monitored: 766,
        active_heatwave_districts: 142,
        districts: [
          {
            district_id: 'unnao',
            name: 'Unnao',
            state: 'Uttar Pradesh',
            temp_c: 43.8,
            wbgt_c: 32.1,
            heat_index_c: 49.2,
            alert_level: 'ORANGE',
            curfew_mandate_active: true,
            curfew_window: '12:00-15:30 IST'
          },
          {
            district_id: 'lucknow',
            name: 'Lucknow',
            state: 'Uttar Pradesh',
            temp_c: 44.1,
            wbgt_c: 32.6,
            heat_index_c: 50.4,
            alert_level: 'RED',
            curfew_mandate_active: true,
            curfew_window: '12:00-15:30 IST'
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/api/v1/telemetry/station/{stationId}',
      desc: '15-minute cadence automatic weather station dry-bulb, wet-bulb, humidity, and solar radiation.',
      sampleResponse: {
        station_id: 'AWS-UNNAO-01',
        name: 'Unnao Central Met Observatory',
        coordinates: { lat: 26.5393, lng: 80.4878 },
        observation_time: '2026-09-12T10:15:00Z',
        qc_status: 'ISO_9001_VERIFIED',
        metrics: {
          dry_bulb_temp_c: 43.8,
          wet_bulb_temp_c: 28.4,
          dew_point_c: 23.1,
          relative_humidity_pct: 42,
          solar_radiation_w_m2: 910,
          wind_speed_kmh: 8.5,
          atmospheric_pressure_hpa: 1004.2
        }
      }
    },
    {
      method: 'GET',
      path: '/api/v1/forecast/7-day/{pincode}',
      desc: '7-day ensemble numerical weather prediction biometeorological risk forecasts with confidence intervals.',
      sampleResponse: {
        pincode: '209801',
        district: 'Unnao',
        model: 'NCUM-Global-Ensemble-v4',
        forecast_horizon_days: 7,
        forecast: [
          { date: '2026-09-12', max_temp_c: 44.0, min_temp_c: 30.5, alert: 'RED', wbgt_peak: 32.8 },
          { date: '2026-09-13', max_temp_c: 44.5, min_temp_c: 31.0, alert: 'RED', wbgt_peak: 33.1 },
          { date: '2026-09-14', max_temp_c: 43.2, min_temp_c: 29.8, alert: 'ORANGE', wbgt_peak: 31.9 },
          { date: '2026-09-15', max_temp_c: 41.8, min_temp_c: 28.5, alert: 'ORANGE', wbgt_peak: 31.2 },
          { date: '2026-09-16', max_temp_c: 40.0, min_temp_c: 27.8, alert: 'YELLOW', wbgt_peak: 29.5 },
          { date: '2026-09-17', max_temp_c: 38.5, min_temp_c: 26.5, alert: 'YELLOW', wbgt_peak: 28.2 },
          { date: '2026-09-18', max_temp_c: 37.0, min_temp_c: 25.8, alert: 'GREEN', wbgt_peak: 27.0 }
        ]
      }
    },
  ];

  const handleDownloadDoc = (doc: PolicyDocument, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingDocId(doc.id);
    try {
      const fileName = `${doc.id}_official_guideline_2026.txt`;
      const blob = new Blob([doc.fullTextContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setTimeout(() => setDownloadingDocId(null), 2500);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadingDocId(null);
    }
  };

  const handleCopyText = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredDocs = policyDocuments.filter(doc => {
    if (activeCategory === 'all') return true;
    return doc.category === activeCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Executive Command Header */}
      <div className="rounded-2xl p-6 sm:p-8 gov-hero-command border border-[#1E4373] text-white shadow-lg space-y-3 relative overflow-hidden">
        {/* Ashoka Chakra Watermark */}
        <div 
          className="absolute -right-10 -bottom-12 w-64 h-64 opacity-[0.06] pointer-events-none select-none"
          aria-hidden="true"
        >
          <Database className="w-full h-full text-white" />
        </div>

        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <span className="text-[10px] font-mono uppercase bg-[#135A9C] text-white px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-xs">
            SCIENTIFIC & DATA REPOSITORY
          </span>
          <span className="text-xs text-[#E5A93C] font-mono font-bold flex items-center gap-1">
            · Open Government Data & Statutory Policies
          </span>
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight relative z-10">
          {isHindi ? 'राष्ट्रीय ताप डेटा, आधिकारिक नीतियां एवं संसाधन' : 'National Heat Data, Official Guidelines & Technical Resources'}
        </h1>
        
        <p className="text-xs sm:text-sm text-[#93C5FD] font-normal leading-relaxed relative z-10 max-w-3xl">
          {isHindi 
            ? 'शोधकर्ताओं, नीति निर्माताओं एवं नागरिकों के लिए आधिकारिक ओपन डेटा, एपीआई एवं दिशा-निर्देश' 
            : 'Open access repositories, statutory workplace curfews, hospital clinical triage, biometeorological standards, and district heat action plan documentation.'}
        </p>

        {/* Quick Reference Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-[#D9E2EC]">
          <span className="bg-[#135A9C]/60 border border-[#135A9C] px-2.5 py-1 rounded text-white font-medium">
            📋 4 Statutory Frameworks
          </span>
          <span className="bg-[#135A9C]/60 border border-[#135A9C] px-2.5 py-1 rounded text-white font-medium">
            ⚠️ 12:00–15:30 Labor Curfew
          </span>
          <span className="bg-[#135A9C]/60 border border-[#135A9C] px-2.5 py-1 rounded text-white font-medium">
            🏥 Code Red ER Triage
          </span>
          <span className="bg-[#135A9C]/60 border border-[#135A9C] px-2.5 py-1 rounded text-white font-medium">
            🧮 ISO 7243 WBGT Formula
          </span>
          <span className="bg-[#135A9C]/60 border border-[#135A9C] px-2.5 py-1 rounded text-white font-medium">
            📡 3 Open REST APIs
          </span>
        </div>
      </div>

      {/* Official Guidelines & Heat Action Plans */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9E2EC] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#135A9C]" />
              <h2 className="font-bold text-base text-[#0B1F3A]">
                Official Policy Guidelines & Heat Action Plans
              </h2>
            </div>
            <p className="text-xs text-[#526273] mt-0.5">
              Approved government frameworks for heatwave management, workplace curfews, and clinical triage.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: isHindi ? 'सभी दिशा-निर्देश' : 'All Frameworks (4)' },
              { id: 'workplace', label: isHindi ? 'कार्यस्थल व कर्फ्यू' : 'Workplace Curfew' },
              { id: 'clinical', label: isHindi ? 'अस्पताल व ट्रायज' : 'Clinical Triage' },
              { id: 'hap', label: isHindi ? 'हीट एक्शन प्लान' : 'NDMA HAP' },
              { id: 'meteorological', label: isHindi ? 'आईएमडी मानक' : 'IMD SOP' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#135A9C] text-white shadow-xs'
                    : 'bg-[#F0F4F8] hover:bg-[#E2E8F0] text-[#526273]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Highlight 1: Mandatory Workplace Curfew */}
          <div className="p-3.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
            <div className="p-2 rounded bg-white border border-[#FDE68A] text-[#92400E] shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#92400E] text-xs uppercase tracking-wide">
                  Statutory Workplace Curfew (DGFASLI)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#B45309] text-white font-mono text-[10px] font-bold">
                  12:00–15:30 IST
                </span>
              </div>
              <p className="text-[#78350F] text-[11px] leading-relaxed">
                Mandatory prohibition of heavy outdoor physical labor (construction, quarries, agriculture) when Air Temp &gt; 40°C or WBGT &gt; 31°C. Employers must provide free 3-5L cold water & ORS. Non-compliance invites prosecution under Factories Act Section 92.
              </p>
            </div>
          </div>

          {/* Highlight 2: Clinical Emergency Triage */}
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-3">
            <div className="p-2 rounded bg-white border border-[#FECACA] text-[#991B1B] shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#991B1B] text-xs uppercase tracking-wide">
                  Emergency Department Code Red Triage (NCDC)
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#DC2626] text-white font-mono text-[10px] font-bold">
                  Target &lt; 39°C in 30m
                </span>
              </div>
              <p className="text-[#7F1D1D] text-[11px] leading-relaxed">
                Patients with Core Temp &gt; 40°C & CNS symptoms must receive immediate whole-body cold water immersion (1-14°C) or continuous evaporative misting. Antipyretics (Paracetamol/Aspirin) are STRICTLY CONTRAINDICATED.
              </p>
            </div>
          </div>
        </div>

        {/* Documents Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {filteredDocs.map((doc) => {
            const isDownloading = downloadingDocId === doc.id;
            return (
              <div 
                key={doc.id} 
                className="p-4 rounded-xl bg-[#F5F8FB] border border-[#D9E2EC] hover:border-[#135A9C] transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded border border-[#CBD5E1] text-[#135A9C] font-bold">
                      {doc.category === 'workplace' && 'Workplace & Curfew'}
                      {doc.category === 'clinical' && 'Clinical & Hospital'}
                      {doc.category === 'hap' && 'NDMA Master HAP'}
                      {doc.category === 'meteorological' && 'Meteorological SOP'}
                    </span>
                    <span className="text-[10px] font-mono text-[#526273]">{doc.fileSize}</span>
                  </div>

                  <h4 className="font-bold text-[#0B1F3A] text-sm leading-snug group-hover:text-[#135A9C] transition-colors">
                    {doc.title}
                  </h4>

                  <div className="text-[11px] text-[#526273] font-mono">
                    {doc.agency} • <span className="text-[#0B1F3A] font-semibold">{doc.year}</span>
                  </div>

                  <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed">
                    {doc.executiveSummary}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#D9E2EC]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-3 py-1.5 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Read complete official framework document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'दिशा-निर्देश पढ़ें' : 'Read Framework'}</span>
                    </button>

                    <button
                      onClick={(e) => handleDownloadDoc(doc, e)}
                      className="px-2.5 py-1.5 rounded bg-white hover:bg-[#E8EEF5] border border-[#CBD5E1] text-[#0B1F3A] text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                      title="Download full official document (.txt)"
                    >
                      {isDownloading ? <Check className="w-3.5 h-3.5 text-[#16804A]" /> : <Download className="w-3.5 h-3.5 text-[#135A9C]" />}
                      <span>{isDownloading ? 'Saved!' : 'Download'}</span>
                    </button>
                  </div>

                  <button
                    onClick={(e) => handleCopyText(`${doc.title} (${doc.agency}) Ref: ${doc.gazetteRef}`, doc.id, e)}
                    className="p-1.5 rounded hover:bg-white text-[#526273] hover:text-[#0B1F3A] cursor-pointer transition-colors"
                    title="Copy official citation"
                  >
                    {copiedKey === doc.id ? <Check className="w-3.5 h-3.5 text-[#16804A]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biometeorological Algorithms & Standards */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E2EC] pb-3">
          <div>
            <h2 className="font-bold text-base text-[#0B1F3A]">
              Biometeorological Formulas & Scientific Standards
            </h2>
            <p className="text-xs text-[#526273]">
              Mathematical formulations implemented in the HeatShield AI real-time computing engine.
            </p>
          </div>

          <button
            onClick={() => setIsFormulaCalculatorOpen(!isFormulaCalculatorOpen)}
            className="px-3 py-1.5 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors w-fit"
          >
            <Calculator className="w-3.5 h-3.5 text-[#F4A62A]" />
            <span>{isFormulaCalculatorOpen ? 'Hide Test Calculator' : 'Interactive Formula Sandbox'}</span>
          </button>
        </div>

        {/* Live Formula Test Sandbox */}
        {isFormulaCalculatorOpen && (
          <div className="p-4 rounded-xl bg-[#F0F4F8] border border-[#CBD5E1] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B1F3A] uppercase tracking-wide">
                Live Biometeorological Formula Sandbox
              </span>
              <span className="text-[11px] text-[#526273]">Adjust atmospheric parameters to test live index calculations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-white border border-[#CBD5E1] space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Dry Bulb Temp (Ta):</span>
                  <strong className="text-[#0B1F3A]">{calcTemp}°C</strong>
                </div>
                <input
                  type="range"
                  min="25"
                  max="50"
                  step="0.5"
                  value={calcTemp}
                  onChange={(e) => setCalcTemp(parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#135A9C]"
                />
              </div>

              <div className="p-3 rounded bg-white border border-[#CBD5E1] space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Relative Humidity:</span>
                  <strong className="text-[#0B1F3A]">{calcHumidity}%</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={calcHumidity}
                  onChange={(e) => setCalcHumidity(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-[#135A9C]"
                />
              </div>

              <div className="p-3 rounded bg-white border border-[#CBD5E1] space-y-1">
                <div className="flex justify-between font-mono">
                  <span>Solar Radiation:</span>
                  <strong className="text-[#0B1F3A]">{calcSolar} W/m²</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1100"
                  step="50"
                  value={calcSolar}
                  onChange={(e) => setCalcSolar(parseInt(e.target.value))}
                  className="w-full cursor-pointer accent-[#135A9C]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-center font-mono">
              <div className="p-2.5 rounded bg-white border border-[#CBD5E1]">
                <span className="text-[10px] text-[#526273] block uppercase font-sans">NOAA Heat Index</span>
                <span className={`text-base font-bold ${liveHI >= 45 ? 'text-[#C7352B]' : 'text-[#D97706]'}`}>
                  {liveHI}°C
                </span>
                <span className="text-[10px] text-[#526273] block mt-0.5">Apparent Temp</span>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#CBD5E1]">
                <span className="text-[10px] text-[#526273] block uppercase font-sans">Outdoor WBGT</span>
                <span className={`text-base font-bold ${liveWBGT >= 31 ? 'text-[#C7352B]' : 'text-[#D97706]'}`}>
                  {liveWBGT}°C
                </span>
                <span className="text-[10px] text-[#526273] block mt-0.5">
                  {liveWBGT >= 31 ? '⚠️ Curfew Triggered' : 'Normal Work Regimen'}
                </span>
              </div>

              <div className="p-2.5 rounded bg-white border border-[#CBD5E1] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#526273] block uppercase font-sans">Statutory Work Restriction</span>
                <span className="text-xs font-bold text-[#0B1F3A] block mt-1">
                  {liveWBGT >= 32.5 ? 'Total Labor Stoppage' : liveWBGT >= 31.0 ? '25% Work / 75% Rest' : liveWBGT >= 29.5 ? '50% Work / 50% Rest' : 'Normal Labor Permitted'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <span className="font-bold text-[#135A9C] text-sm block">1. WBGT (ISO 7243)</span>
            <p className="text-[#17202A] font-sans text-xs">
              <strong>Outdoor Formula:</strong><br />
              <code className="text-[#135A9C]">WBGT = 0.7*Tw + 0.2*Tg + 0.1*Td</code>
            </p>
            <p className="text-[#526273] font-sans text-[11px] leading-relaxed">
              Standard for thermal stress on outdoor workers accounting for solar radiative load, ambient temperature, humidity, and air motion.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <span className="font-bold text-[#135A9C] text-sm block">2. NOAA Heat Index</span>
            <p className="text-[#17202A] font-sans text-xs">
              <strong>Steadman Polynomial:</strong><br />
              <code className="text-[#135A9C]">HI = c1 + c2*T + c3*R + c4*T*R...</code>
            </p>
            <p className="text-[#526273] font-sans text-[11px] leading-relaxed">
              Apparent perceived temperature combining ambient dry bulb temperature and relative humidity calibrated for human thermoregulation.
            </p>
          </div>

          <div className="p-3.5 rounded bg-[#F5F8FB] border border-[#D9E2EC] space-y-1.5">
            <span className="font-bold text-[#135A9C] text-sm block">3. UTCI Index</span>
            <p className="text-[#17202A] font-sans text-xs">
              <strong>Universal Thermal Index:</strong><br />
              <code className="text-[#135A9C]">UTCI = f(Ta, Tmrt, va, pa)</code>
            </p>
            <p className="text-[#526273] font-sans text-[11px] leading-relaxed">
              Derived from the Fiala multi-node biophysical model, capturing dynamic physiological heat exchange in varied urban geometries.
            </p>
          </div>
        </div>
      </div>

      {/* Open Data APIs */}
      <div className="gov-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
          <div>
            <h2 className="font-bold text-base text-[#0B1F3A]">
              Open Government Data & Public APIs
            </h2>
            <p className="text-xs text-[#526273]">
              RESTful APIs formatted under Open Geospatial Consortium (OGC) and National Data Sharing standards.
            </p>
          </div>
          <Code2 className="w-5 h-5 text-[#135A9C]" />
        </div>

        <div className="space-y-3 text-xs font-mono">
          {apiEndpoints.map((ep, idx) => {
            const isExpanded = expandedApiIdx === idx;
            return (
              <div key={idx} className="p-3.5 rounded-lg bg-[#F5F8FB] border border-[#D9E2EC] space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-[#135A9C] text-white font-bold text-[10px]">
                        {ep.method}
                      </span>
                      <span className="font-bold text-[#0B1F3A]">{ep.path}</span>
                    </div>
                    <p className="font-sans text-[11px] text-[#526273]">{ep.desc}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopyText(ep.path, `api_${idx}`)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0B1F3A] text-[11px] font-sans font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy endpoint path"
                    >
                      {copiedKey === `api_${idx}` ? <Check className="w-3 h-3 text-[#16804A]" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `api_${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => setExpandedApiIdx(isExpanded ? null : idx)}
                      className="px-2.5 py-1 rounded bg-[#135A9C] hover:bg-[#0B1F3A] text-white text-[11px] font-sans font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Payload' : 'View Sample JSON'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Expandable JSON Payload Sample */}
                {isExpanded && (
                  <div className="p-3 rounded bg-[#0B132B] text-[#86EFAC] text-[11px] font-mono overflow-x-auto border border-[#1E293B] animate-in fade-in">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[10px] text-[#94A3B8]">
                      <span>HTTP 200 OK • Content-Type: application/json</span>
                      <button
                        onClick={() => handleCopyText(JSON.stringify(ep.sampleResponse, null, 2), `json_${idx}`)}
                        className="text-[#38BDF8] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `json_${idx}` ? <Check className="w-3 h-3 text-[#86EFAC]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === `json_${idx}` ? 'JSON Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                    <pre className="text-left leading-relaxed">
                      {JSON.stringify(ep.sampleResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy Document Reader Modal */}
      <PolicyDocumentViewerModal
        isOpen={selectedDoc !== null}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        language={language}
      />

    </div>
  );
};
