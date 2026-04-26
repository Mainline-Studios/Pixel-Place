import type { SupportedLocale } from './supportedLocales';
import type { LoginUiStrings } from './loginUiTypes';
import { LOGIN_EN_US } from './loginUi.en';
import {
  LOGIN_DE_DE,
  LOGIN_ES_ES,
  LOGIN_ES_MX,
  LOGIN_FR_FR,
  LOGIN_IT_IT,
  LOGIN_PT_BR,
  LOGIN_PT_PT,
} from './loginUi.locales.part1';
import {
  LOGIN_CS_CZ,
  LOGIN_EL_GR,
  LOGIN_HU_HU,
  LOGIN_NL_NL,
  LOGIN_PL_PL,
  LOGIN_RO_RO,
  LOGIN_RU_RU,
  LOGIN_UK_UA,
} from './loginUi.locales.part2';
import {
  LOGIN_AR_SA,
  LOGIN_HE_IL,
  LOGIN_HI_IN,
  LOGIN_JA_JP,
  LOGIN_KO_KR,
  LOGIN_TR_TR,
  LOGIN_ZH_CN,
  LOGIN_ZH_TW,
} from './loginUi.locales.part3';
import {
  LOGIN_DA_DK,
  LOGIN_FIL_PH,
  LOGIN_FI_FI,
  LOGIN_ID_ID,
  LOGIN_NB_NO,
  LOGIN_SV_SE,
  LOGIN_TH_TH,
  LOGIN_VI_VN,
} from './loginUi.locales.part4';

export const LOGIN_UI: Record<SupportedLocale, LoginUiStrings> = {
  'en-US': LOGIN_EN_US,
  'es-MX': LOGIN_ES_MX,
  'es-ES': LOGIN_ES_ES,
  'fr-FR': LOGIN_FR_FR,
  'de-DE': LOGIN_DE_DE,
  'it-IT': LOGIN_IT_IT,
  'pt-BR': LOGIN_PT_BR,
  'pt-PT': LOGIN_PT_PT,
  'nl-NL': LOGIN_NL_NL,
  'pl-PL': LOGIN_PL_PL,
  'ru-RU': LOGIN_RU_RU,
  'uk-UA': LOGIN_UK_UA,
  'ja-JP': LOGIN_JA_JP,
  'ko-KR': LOGIN_KO_KR,
  'zh-CN': LOGIN_ZH_CN,
  'zh-TW': LOGIN_ZH_TW,
  'hi-IN': LOGIN_HI_IN,
  'ar-SA': LOGIN_AR_SA,
  'tr-TR': LOGIN_TR_TR,
  'vi-VN': LOGIN_VI_VN,
  'th-TH': LOGIN_TH_TH,
  'id-ID': LOGIN_ID_ID,
  'fil-PH': LOGIN_FIL_PH,
  'sv-SE': LOGIN_SV_SE,
  'da-DK': LOGIN_DA_DK,
  'nb-NO': LOGIN_NB_NO,
  'fi-FI': LOGIN_FI_FI,
  'cs-CZ': LOGIN_CS_CZ,
  'el-GR': LOGIN_EL_GR,
  'he-IL': LOGIN_HE_IL,
  'ro-RO': LOGIN_RO_RO,
  'hu-HU': LOGIN_HU_HU,
};

export function getLoginUiStrings(locale: SupportedLocale): LoginUiStrings {
  return LOGIN_UI[locale] ?? LOGIN_EN_US;
}
