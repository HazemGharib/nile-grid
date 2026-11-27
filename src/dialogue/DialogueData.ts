import { DialogueEntry } from '../state/GameState';

export interface DialogueSequence {
  id: string;
  triggerId: string;
  entries: DialogueEntry[];
  isPortraitSequence: boolean;
}

export const mission1Dialogue: DialogueSequence[] = [
  {
    id: 'mission1_intro',
    triggerId: 'mission1_start',
    isPortraitSequence: false,
    entries: [
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: 'The station is full of eyes, Adel. Even the fountain in Orabi is watching.',
        textAr: 'المحطة مليانة عيون يا عادل. حتى النافورة في عرابي بتتفرج.',
        isPortraitDialogue: false,
        emotion: 'concerned'
      },
      {
        speakerId: 'adel',
        speakerName: 'Adel',
        speakerNameAr: 'عادل',
        textEn: 'Wait. Bolbol will feel out the gate. Laila — the cameras?',
        textAr: 'استنى.. بولبول هيحساس البوابة. ليلى، الكاميرات؟',
        isPortraitDialogue: false,
        emotion: 'neutral'
      },
      {
        speakerId: 'laila',
        speakerName: 'Laila',
        speakerNameAr: 'ليلى',
        textEn: "On the façade. I'll loop them for a few seconds. Don't be late.",
        textAr: 'على الواجهة. هلفّهم كام ثانية. متتأخرش.',
        isPortraitDialogue: false,
        emotion: 'neutral'
      }
    ]
  },
  {
    id: 'umm_sayed_intro',
    triggerId: 'umm_sayed_talk',
    isPortraitSequence: true,
    entries: [
      {
        speakerId: 'umm_sayed',
        speakerName: 'Umm Sayed',
        speakerNameAr: 'أم سيد',
        textEn: "Have a sip. The boats have been sitting on Timsah for days. The south alley is quieter when the light goes out.",
        textAr: 'اشربوا ديل قهوة. المراكب واقفة على التمساح من أيام. الحارة الجنوبي تبقى أهدى لما النور يطفي.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      },
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: "We'll cross, Umm Sayed. The moment the camera goes to sleep.",
        textAr: 'هنعدّي يا أم سيد. أول ما الكاميرا تنام.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      }
    ]
  }
];

export const mission2Dialogue: DialogueSequence[] = [
  {
    id: 'mission2_intro',
    triggerId: 'mission2_start',
    isPortraitSequence: false,
    entries: [
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: 'Afrang is as tight as ever. Is this the square?',
        textAr: 'الإفرنج ضيق زي ما هو. ده الميدان؟',
        isPortraitDialogue: false,
        emotion: 'neutral'
      },
      {
        speakerId: 'adel',
        speakerName: 'Adel',
        speakerNameAr: 'عادل',
        textEn: "The flag on the balcony is still Ismaily. The Brazil of Egypt doesn't like a city that's been shut.",
        textAr: 'العلم على البلكونة لسه إسماعيلي. برازيل مصر ما بيحبوش البلد تتقفل.',
        isPortraitDialogue: false,
        emotion: 'neutral'
      },
      {
        speakerId: 'laila',
        speakerName: 'Laila',
        speakerNameAr: 'ليلى',
        textEn: 'The schedule is at the kiosk. The work is in the street — not at the mosque, and not at the church.',
        textAr: 'الجدول عند الكشك. الشغل في الشارع.. مش عند الجامع ولا الكنيسة.',
        isPortraitDialogue: false,
        emotion: 'neutral'
      }
    ]
  },
  {
    id: 'karim_talk',
    triggerId: 'karim_talk',
    isPortraitSequence: true,
    entries: [
      {
        speakerId: 'karim',
        speakerName: 'Karim',
        speakerNameAr: 'كريم',
        textEn: "The patrols loop Gumhuriya every nine minutes. Copy the mesh and go. This quarter knows itself — don't let it turn into a war.",
        textAr: 'الدوريات بتلف الجمهورية كل تسع دقايق. انسخوا الشبكة وامشوا. الحي ده عارف بعضه، متخلّوش يبقى حرب.',
        isPortraitDialogue: true,
        emotion: 'concerned'
      },
      {
        speakerId: 'laila',
        speakerName: 'Laila',
        speakerNameAr: 'ليلى',
        textEn: "We'll copy it and we'll go.",
        textAr: 'هانسخ ونمشي.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      },
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: "I'll cross the square. Adel holds the alley.",
        textAr: 'أنا بعدّي الميدان. عادل يمسك الحارة.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      }
    ]
  }
];

export const mission3Dialogue: DialogueSequence[] = [
  {
    id: 'hajj_rashid_talk',
    triggerId: 'hajj_rashid_talk',
    isPortraitSequence: true,
    entries: [
      {
        speakerId: 'hajj_rashid',
        speakerName: 'Hajj Rashid',
        speakerNameAr: 'حاج رشيد',
        textEn: "The old key is in the house there, and its handshake is in the museum. Without them, Guidance will not hear you. The Sweet-Water Canal is in front of you; Bridge 3 is jammed.",
        textAr: 'المفتاح القديم في البيت هناك، والتوقيع بتاعه في المتحف. من غيرهم، الإرشاد مش هيسمعكم. الترعة قدامكم؛ كوبري تلاتة عطلان.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      },
      {
        speakerId: 'laila',
        speakerName: 'Laila',
        speakerNameAr: 'ليلى',
        textEn: 'The museum locks are old. Leave the cameras to me.',
        textAr: 'أقفال المتحف قديمة. سيب الكاميرات عليا.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      },
      {
        speakerId: 'adel',
        speakerName: 'Adel',
        speakerNameAr: 'عادل',
        textEn: "The bridge is mine. I don't like a canal that isn't moving.",
        textAr: 'الكوبري عليا. أنا ما بحبش ترعة واقفة.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      },
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: "And I'll get the key and catch up. Before the boats sit on the lake another week.",
        textAr: 'وأنا أجيب المفتاح وألحقكوا. قبل ما المراكب تفضل على البحيرة كمان أسبوع.',
        isPortraitDialogue: true,
        emotion: 'neutral'
      }
    ]
  },
  {
    id: 'bridge_opened',
    triggerId: 'bridge_repair_complete',
    isPortraitSequence: false,
    entries: [
      {
        speakerId: 'adel',
        speakerName: 'Adel',
        speakerNameAr: 'عادل',
        textEn: 'There you go, canal.',
        textAr: 'اتفضلي يا ترعة.',
        isPortraitDialogue: false,
        emotion: 'happy'
      },
      {
        speakerId: 'nour',
        speakerName: 'Nour',
        speakerNameAr: 'نور',
        textEn: "The garden still smells of mango… and of iron from over there. Come on. The park is next.",
        textAr: 'ريحة المانجا لسه في الجنينة.. وريحة الحديد من هناك. يلا، الحديقة بعدها.',
        isPortraitDialogue: false,
        emotion: 'neutral'
      },
      {
        speakerId: 'laila',
        speakerName: 'Laila',
        speakerNameAr: 'ليلى',
        textEn: 'Guidance is close now. We finish the rest later.',
        textAr: 'الإرشاد بقى قريب. نكمّل بعدين.',
        isPortraitDialogue: false,
        emotion: 'neutral'
      }
    ]
  }
];

export function getDialogueForTrigger(triggerId: string): DialogueSequence | undefined {
  const allDialogue = [...mission1Dialogue, ...mission2Dialogue, ...mission3Dialogue];
  return allDialogue.find(d => d.triggerId === triggerId);
}

export function getDialogueForMission(missionId: number): DialogueSequence[] {
  switch (missionId) {
    case 1: return mission1Dialogue;
    case 2: return mission2Dialogue;
    case 3: return mission3Dialogue;
    default: return [];
  }
}
