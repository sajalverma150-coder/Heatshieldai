import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, Flame, Skull } from 'lucide-react';
import { HeatRiskLevel, LanguageCode } from '../types';

export interface RiskStandard {
  level: HeatRiskLevel;
  numericScore: number; // 1 to 10
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  shape: 'circle' | 'triangle' | 'square' | 'diamond' | 'hexagon';
  shapeLabel: string;
  labelEn: string;
  labelHi: string;
  meaningEn: string;
  meaningHi: string;
  actionGuidanceEn: string;
  actionGuidanceHi: string;
}

export const RISK_STANDARDS: Record<HeatRiskLevel, RiskStandard> = {
  MINIMAL: {
    level: 'MINIMAL',
    numericScore: 2.1,
    color: '#16804A',
    bgColor: '#EAF6EE',
    borderColor: '#16804A',
    textColor: '#0E5531',
    shape: 'circle',
    shapeLabel: '● Circle',
    labelEn: 'Minimal Risk',
    labelHi: 'न्यूनतम जोखिम',
    meaningEn: 'Normal conditions',
    meaningHi: 'सामान्य मौसमी स्थिति',
    actionGuidanceEn: 'No unusual hazard. Maintain standard daily hydration (2-3 L).',
    actionGuidanceHi: 'कोई असामान्य खतरा नहीं। दैनिक 2-3 लीटर पानी का सेवन जारी रखें।',
  },
  MODERATE: {
    level: 'MODERATE',
    numericScore: 4.8,
    color: '#E5A400',
    bgColor: '#FFFBEA',
    borderColor: '#E5A400',
    textColor: '#8C6400',
    shape: 'triangle',
    shapeLabel: '▲ Triangle',
    labelEn: 'Moderate Risk - Caution',
    labelHi: 'मध्यम जोखिम - सावधानी',
    meaningEn: 'Caution required for sensitive individuals',
    meaningHi: 'संवेदनशील व्यक्तियों के लिए सावधानी आवश्यक',
    actionGuidanceEn: 'Limit prolonged sun exposure. Carry drinking water when outdoors.',
    actionGuidanceHi: 'लंबे समय तक धूप में न रहें। बाहर जाते समय पीने का पानी साथ रखें।',
  },
  HIGH: {
    level: 'HIGH',
    numericScore: 7.2,
    color: '#E87500',
    bgColor: '#FFF4E6',
    borderColor: '#E87500',
    textColor: '#9C4E00',
    shape: 'square',
    shapeLabel: '■ Square',
    labelEn: 'High Risk - Protective Action',
    labelHi: 'उच्च जोखिम - सुरक्षा उपाय आवश्यक',
    meaningEn: 'Protective action recommended',
    meaningHi: 'सुरक्षात्मक कदम उठाना आवश्यक',
    actionGuidanceEn: 'Avoid direct sunlight 12 PM - 4 PM. Drink ORS/fluids every 30 mins.',
    actionGuidanceHi: 'दोपहर 12 से 4 बजे के बीच धूप से बचें। हर 30 मिनट में पानी/ओआरएस पिएं।',
  },
  VERY_HIGH: {
    level: 'VERY_HIGH',
    numericScore: 8.9,
    color: '#C7352B',
    bgColor: '#FDF0EE',
    borderColor: '#C7352B',
    textColor: '#8E2018',
    shape: 'diamond',
    shapeLabel: '◆ Diamond',
    labelEn: 'Very High Risk - Take Action',
    labelHi: 'अत्यंत उच्च जोखिम - तत्काल कदम उठाएं',
    meaningEn: 'Severe health risk of heat exhaustion and cramps',
    meaningHi: 'लू और ताप आघात का गंभीर स्वास्थ्य जोखिम',
    actionGuidanceEn: 'Cease outdoor heavy labor. Stay in cool shelters. Call 108 if dizzy.',
    actionGuidanceHi: 'धूप में भारी श्रम बंद करें। शीतल आश्रय में रहें। चक्कर आने पर 108 डायल करें।',
  },
  EXTREME: {
    level: 'EXTREME',
    numericScore: 9.8,
    color: '#7A1F2B',
    bgColor: '#F9E9EC',
    borderColor: '#7A1F2B',
    textColor: '#57131D',
    shape: 'hexagon',
    shapeLabel: '⬢ Hexagon',
    labelEn: 'Extreme Risk - Emergency Response',
    labelHi: 'चरम जोखिम - आपातकालीन स्थिति',
    meaningEn: 'Emergency response active; life-threatening heat stroke risk',
    meaningHi: 'आपातकालीन प्रतिक्रिया सक्रिय; प्राणघातक हीट स्ट्रोक का खतरा',
    actionGuidanceEn: 'Mandatory heat curfew. Hospitals on high alert. Immediate cooling needed.',
    actionGuidanceHi: 'दोपहर अनिवार्य कर्फ्यू। अस्पताल हाई अलर्ट पर। तुरंत शीतलन आवश्यक।',
  },
};

export function getRiskStandard(levelOrTemp: string | number): RiskStandard {
  if (typeof levelOrTemp === 'number') {
    if (levelOrTemp >= 44 || levelOrTemp >= 33.5) return RISK_STANDARDS.EXTREME;
    if (levelOrTemp >= 40 || levelOrTemp >= 31.5) return RISK_STANDARDS.VERY_HIGH;
    if (levelOrTemp >= 36 || levelOrTemp >= 29.0) return RISK_STANDARDS.HIGH;
    if (levelOrTemp >= 32 || levelOrTemp >= 26.5) return RISK_STANDARDS.MODERATE;
    return RISK_STANDARDS.MINIMAL;
  }

  const normalized = (levelOrTemp || '').toUpperCase();
  if (normalized.includes('EXTREME') || normalized.includes('CRITICAL')) return RISK_STANDARDS.EXTREME;
  if (normalized.includes('VERY_HIGH') || normalized.includes('VERY HIGH') || normalized.includes('SEVERE')) return RISK_STANDARDS.VERY_HIGH;
  if (normalized.includes('HIGH') || normalized.includes('ORANGE')) return RISK_STANDARDS.HIGH;
  if (normalized.includes('MODERATE') || normalized.includes('YELLOW')) return RISK_STANDARDS.MODERATE;
  return RISK_STANDARDS.MINIMAL;
}

export function getRiskScore(temp: number, wbgt: number, humidity: number): number {
  let score = 2.0;
  if (temp >= 45 || wbgt >= 33) score = 9.8;
  else if (temp >= 42 || wbgt >= 31.5) score = 8.9;
  else if (temp >= 38 || wbgt >= 29) score = 7.4;
  else if (temp >= 34 || wbgt >= 27) score = 5.2;
  else score = 2.5;

  if (humidity > 60 && temp > 35) score = Math.min(10, score + 0.8);
  return Number(score.toFixed(1));
}
