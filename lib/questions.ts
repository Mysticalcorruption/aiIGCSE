import { QuestionItem, TenseBucket, TopicKey } from "@/lib/types";

export const QUESTION_BANK: QuestionItem[] = [
  { id: "ha-1", topic: "home-abroad", title: "Home and abroad", subtopic: "Life in the town and rural life", tense: "present", promptFr: "Où habites-tu et depuis quand ? Fais une description de ta région ou de ta ville." },
  { id: "ha-2", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "present", promptFr: "Qu'est-ce que les touristes peuvent faire dans ta ville ?" },
  { id: "ha-3", topic: "home-abroad", title: "Home and abroad", subtopic: "Customs", tense: "present", promptFr: "Quelle est ta fête préférée et pourquoi ?" },
  { id: "ha-4", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "present", promptFr: "Quel est ton moyen de transport préféré quand tu pars en vacances ?" },
  { id: "ha-5", topic: "home-abroad", title: "Home and abroad", subtopic: "Life in the town and rural life", tense: "present", promptFr: "Quels sont les avantages et les inconvénients de vivre en ville ou à la campagne ?" },
  { id: "ha-6", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "present", promptFr: "Pourquoi est-il important de partir en vacances ?" },
  { id: "ha-7", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "past", promptFr: "Qu'est-ce que tu as fait en vacances l'année dernière ?" },
  { id: "ha-8", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "past", promptFr: "Où allais-tu en vacances quand tu étais petit et que faisais-tu ?" },
  { id: "ha-9", topic: "home-abroad", title: "Home and abroad", subtopic: "Customs", tense: "past", promptFr: "Comment as-tu fêté ton dernier anniversaire ?" },
  { id: "ha-10", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "future", promptFr: "Qu'est-ce que tu feras ce weekend ?" },
  { id: "ha-11", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "future", promptFr: "Où vas-tu passer tes vacances l'année prochaine et que feras-tu ?" },
  { id: "ha-12", topic: "home-abroad", title: "Home and abroad", subtopic: "Life in the town and rural life", tense: "future", promptFr: "À l'avenir, tu penses que tu habiteras en ville ou à la campagne ? Pourquoi ?" },
  { id: "ha-13", topic: "home-abroad", title: "Home and abroad", subtopic: "Holidays, tourist information and directions", tense: "conditional", promptFr: "Si tu avais le choix, où voudrais-tu aller en vacances si tu avais beaucoup d'argent ?" },
  { id: "ha-14", topic: "home-abroad", title: "Home and abroad", subtopic: "Everyday life, traditions and communities", tense: "conditional", promptFr: "Dirais-tu que les traditions locales sont importantes pour le tourisme ? Pourquoi ?" },

  { id: "ee-1", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "present", promptFr: "Fais une description de ton collège." },
  { id: "ee-2", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "present", promptFr: "Quelles sont les matières que tu aimes et que tu n'aimes pas ? Pourquoi ?" },
  { id: "ee-3", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "present", promptFr: "Décris une journée scolaire typique." },
  { id: "ee-4", topic: "education-employment", title: "Education and employment", subtopic: "School trips, events and exchanges", tense: "present", promptFr: "À ton avis, les échanges scolaires sont-ils importants ?" },
  { id: "ee-5", topic: "education-employment", title: "Education and employment", subtopic: "School rules and pressures", tense: "present", promptFr: "Quelles sont les règles à ton collège ?" },
  { id: "ee-6", topic: "education-employment", title: "Education and employment", subtopic: "Work, careers and volunteering", tense: "present", promptFr: "Dans quelle mesure est-ce que les diplômes sont importants pour trouver un bon travail ?" },
  { id: "ee-7", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "past", promptFr: "Quelle a été ta meilleure année à l'école jusqu'à maintenant ?" },
  { id: "ee-8", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "past", promptFr: "Qu'est-ce que tu as fait à l'école hier ?" },
  { id: "ee-9", topic: "education-employment", title: "Education and employment", subtopic: "School life and routine", tense: "past", promptFr: "Comment était ton école primaire ?" },
  { id: "ee-10", topic: "education-employment", title: "Education and employment", subtopic: "Future plans", tense: "future", promptFr: "Après tes examens, quelles matières est-ce que tu vas étudier au lycée ?" },
  { id: "ee-11", topic: "education-employment", title: "Education and employment", subtopic: "Future plans", tense: "future", promptFr: "Tu as l'intention d'aller à l'université ou de prendre une année sabbatique ?" },
  { id: "ee-12", topic: "education-employment", title: "Education and employment", subtopic: "Work, careers and volunteering", tense: "conditional", promptFr: "Si tu étais le directeur, qu'est-ce que tu changerais dans ton collège ?" },
  { id: "ee-13", topic: "education-employment", title: "Education and employment", subtopic: "Work, careers and volunteering", tense: "conditional", promptFr: "Quand tu seras adulte, qu'est-ce que tu voudrais faire comme métier ?" },
  { id: "ee-14", topic: "education-employment", title: "Education and employment", subtopic: "Work, careers and volunteering", tense: "conditional", promptFr: "Aimerais-tu travailler dans un pays étranger ?" },

  { id: "pl-1", topic: "personal-life", title: "Personal life and relationships", subtopic: "House and home", tense: "present", promptFr: "Décris ta maison." },
  { id: "pl-2", topic: "personal-life", title: "Personal life and relationships", subtopic: "Relationships with family and friends", tense: "present", promptFr: "Décris ta famille." },
  { id: "pl-3", topic: "personal-life", title: "Personal life and relationships", subtopic: "Relationships with family and friends", tense: "present", promptFr: "Tu t'entends bien avec ta famille ? Pourquoi ? Pourquoi pas ?" },
  { id: "pl-4", topic: "personal-life", title: "Personal life and relationships", subtopic: "Daily routines and helping at home", tense: "present", promptFr: "Parle-moi d'une journée typique." },
  { id: "pl-5", topic: "personal-life", title: "Personal life and relationships", subtopic: "Daily routines and helping at home", tense: "present", promptFr: "Qu'est-ce que tu fais pour aider à la maison ?" },
  { id: "pl-6", topic: "personal-life", title: "Personal life and relationships", subtopic: "Daily routines and helping at home", tense: "past", promptFr: "Comment aidais-tu tes parents quand tu étais plus jeune ?" },
  { id: "pl-7", topic: "personal-life", title: "Personal life and relationships", subtopic: "Relationships with family and friends", tense: "past", promptFr: "Qu'est-ce que tu as fait avec ta famille le week-end dernier ?" },
  { id: "pl-8", topic: "personal-life", title: "Personal life and relationships", subtopic: "Relationships with family and friends", tense: "future", promptFr: "Qu'est-ce que tu feras avec ta famille le weekend prochain ?" },
  { id: "pl-9", topic: "personal-life", title: "Personal life and relationships", subtopic: "Daily routines and helping at home", tense: "future", promptFr: "Qu'est-ce que tu feras comme tâches ménagères ce weekend ?" },
  { id: "pl-10", topic: "personal-life", title: "Personal life and relationships", subtopic: "House and home", tense: "conditional", promptFr: "Si tu avais beaucoup d'argent, comment serait ta maison idéale ?" },
  { id: "pl-11", topic: "personal-life", title: "Personal life and relationships", subtopic: "House and home", tense: "conditional", promptFr: "Quand tu seras adulte, tu voudrais habiter dans une maison ou dans un appartement ? Pourquoi ?" },

  { id: "wa-1", topic: "world-around-us", title: "The world around us", subtopic: "The media", tense: "present", promptFr: "Tu aimes quel genre de musique ? Pourquoi ?" },
  { id: "wa-2", topic: "world-around-us", title: "The world around us", subtopic: "The media", tense: "present", promptFr: "Parle-moi de ton émission préférée." },
  { id: "wa-3", topic: "world-around-us", title: "The world around us", subtopic: "Environmental issues", tense: "present", promptFr: "Quel effet ont les ordures sur l'environnement ?" },
  { id: "wa-4", topic: "world-around-us", title: "The world around us", subtopic: "Information and communication technology", tense: "present", promptFr: "Quels sont les avantages et les inconvénients de l'internet ?" },
  { id: "wa-5", topic: "world-around-us", title: "The world around us", subtopic: "Travel and transport", tense: "present", promptFr: "Quels sont les avantages et les inconvénients de la voiture ?" },
  { id: "wa-6", topic: "world-around-us", title: "The world around us", subtopic: "Environmental issues", tense: "present", promptFr: "Jusqu'à quel point les jeunes peuvent contribuer à la protection de l'environnement ?" },
  { id: "wa-7", topic: "world-around-us", title: "The world around us", subtopic: "Information and communication technology", tense: "past", promptFr: "As-tu déjà regardé des séries ou des films en ligne ? Pourquoi ?" },
  { id: "wa-8", topic: "world-around-us", title: "The world around us", subtopic: "Environmental issues", tense: "past", promptFr: "Qu'est-ce que tu as recyclé la semaine dernière ?" },
  { id: "wa-9", topic: "world-around-us", title: "The world around us", subtopic: "Information and communication technology", tense: "past", promptFr: "Comment as-tu utilisé l'internet ou les réseaux sociaux récemment ?" },
  { id: "wa-10", topic: "world-around-us", title: "The world around us", subtopic: "Travel and transport", tense: "future", promptFr: "Comment voyageras-tu pour aller en vacances ?" },
  { id: "wa-11", topic: "world-around-us", title: "The world around us", subtopic: "The media", tense: "future", promptFr: "Qu'est-ce que tu regarderas ce soir à la télévision ?" },
  { id: "wa-12", topic: "world-around-us", title: "The world around us", subtopic: "Environmental issues", tense: "future", promptFr: "À l'avenir, qu'est-ce que tu feras pour protéger l'environnement ?" },
  { id: "wa-13", topic: "world-around-us", title: "The world around us", subtopic: "Information and communication technology", tense: "conditional", promptFr: "Est-ce que tu pourrais vivre sans technologie ?" },
  { id: "wa-14", topic: "world-around-us", title: "The world around us", subtopic: "Environmental issues", tense: "conditional", promptFr: "Que pourrait-on faire pour sauver la planète ?" },

  { id: "sf-1", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "present", promptFr: "Qu'est-ce que tu fais pendant ton temps libre ?" },
  { id: "sf-2", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Food and drink", tense: "present", promptFr: "Qu'est-ce que tu aimes manger et boire normalement ?" },
  { id: "sf-3", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "present", promptFr: "Qu'est-ce qu'il faut faire pour rester en bonne santé ?" },
  { id: "sf-4", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Special occasions", tense: "present", promptFr: "Quelle est ta fête préférée ? Pourquoi ?" },
  { id: "sf-5", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "past", promptFr: "Qu'est-ce que tu as fait pendant ton temps libre le weekend dernier ?" },
  { id: "sf-6", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "past", promptFr: "Tu as fait du sport récemment ?" },
  { id: "sf-7", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Special occasions", tense: "past", promptFr: "Parle-moi de ton dernier anniversaire." },
  { id: "sf-8", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "future", promptFr: "Qu'est-ce que tu vas faire à l'avenir pour rester en forme ?" },
  { id: "sf-9", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Special occasions", tense: "future", promptFr: "Comment fêteras-tu la fin de tes examens ?" },
  { id: "sf-10", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "future", promptFr: "Qu'est-ce que tu vas faire pendant ton temps libre le weekend prochain ?" },
  { id: "sf-11", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "conditional", promptFr: "Si tu avais le choix, qu'est-ce que tu ferais pendant un weekend idéal ?" },
  { id: "sf-12", topic: "social-fitness-health", title: "Social activities, fitness and health", subtopic: "Hobbies, interests, sports and exercise", tense: "conditional", promptFr: "Si c'était possible, quel nouveau sport aimerais-tu essayer et pourquoi ?" }
];

export function getQuestions(topic?: TopicKey, tense?: TenseBucket): QuestionItem[] {
  return QUESTION_BANK.filter((q) => (!topic || q.topic === topic) && (!tense || q.tense === tense));
}

export function getRandomQuestion(topic?: TopicKey, tense?: TenseBucket): QuestionItem {
  const filtered = getQuestions(topic, tense);
  return filtered[Math.floor(Math.random() * filtered.length)] ?? QUESTION_BANK[0];
}
