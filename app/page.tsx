"use client";

import React, {
  Component,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo,
  Suspense,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  ContactShadows,
  Instances,
  Instance,
} from "@react-three/drei";
import * as THREE from "three";

// =================== TYPES & DATA ===================

type Terpene = { name: string; aroma: string; value: number };
type Strain = {
  id: number;
  name: string;
  genetics: string;
  type: "indica" | "sativa" | "hybrid" | "cbd";
  typeLabel: string;
  color: string;
  thc: number;
  cbd: number;
  dominant: string;
  description: string;
  terpenes: Terpene[];
  effects: string[];
};

const strains: Strain[] = [
  { id: 1, name: "Northern Lights", genetics: "Afghani × Thai", type: "indica", typeLabel: "Indica", color: "#4A2A3F", thc: 18, cbd: 0.5, dominant: "Myrcen",
    description: "Eine der bekanntesten und ältesten Indica-Sorten überhaupt. Northern Lights zeichnet sich durch ein erdig-süsses Aroma mit deutlicher Kiefer-Note aus. Geschätzt für ihre tief entspannende Wirkung, besonders in den späteren Abendstunden.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 65 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 18 }, { name: "Pinen", aroma: "kiefernartig", value: 10 }, { name: "Limonen", aroma: "zitrusartig", value: 4 } ],
    effects: ["entspannt", "schläfrig", "euphorisch", "schmerzlindernd"] },
  { id: 2, name: "White Widow", genetics: "Brazilian × South Indian", type: "hybrid", typeLabel: "Hybrid", color: "#8B5A2B", thc: 21, cbd: 0.3, dominant: "Myrcen",
    description: "Klassiker der Coffeeshop-Ära Amsterdams aus den 90er-Jahren. Mit ihren weiss schimmernden Trichomen ist sie unverwechselbar im Erscheinungsbild. Balance zwischen entspannender und energetisierender Wirkung — typischer Daytime-Hybrid.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 42 }, { name: "Pinen", aroma: "kiefernartig", value: 28 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 20 }, { name: "Humulen", aroma: "hopfig, holzig", value: 8 } ],
    effects: ["euphorisch", "energiegeladen", "kreativ", "gesprächig"] },
  { id: 3, name: "Sour Diesel", genetics: "Chemdawg × Super Skunk", type: "sativa", typeLabel: "Sativa", color: "#5A6B47", thc: 22, cbd: 0.2, dominant: "Caryophyllen",
    description: "Eine der ikonischen Sativa-Sorten der US-Ostküste. Markant ist das scharfe, dieselartige Aroma — daher der Name. Bekannt für eine schnell einsetzende, klare Wirkung, oft als Tageszeit-Sorte gewählt.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 38 }, { name: "Limonen", aroma: "zitrusartig", value: 32 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 22 }, { name: "Humulen", aroma: "hopfig, holzig", value: 8 } ],
    effects: ["kreativ", "fokussiert", "energiegeladen", "stimmungsaufhellend"] },
  { id: 4, name: "OG Kush", genetics: "Chemdawg × Hindu Kush", type: "hybrid", typeLabel: "Hybrid", color: "#6B4423", thc: 23, cbd: 0.4, dominant: "Myrcen",
    description: "Genetische Grundlage zahlloser kalifornischer Sorten. Komplexes Aroma mit Zitrus, Kiefer und einer typischen erdig-würzigen Tiefe. Bekannt für die deutliche Indica-Wirkung trotz formaler Hybrid-Einstufung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 38 }, { name: "Limonen", aroma: "zitrusartig", value: 35 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 20 }, { name: "Linalool", aroma: "blumig, lavendel", value: 7 } ],
    effects: ["entspannt", "glücklich", "euphorisch", "appetitanregend"] },
  { id: 5, name: "Granddaddy Purple", genetics: "Purple Urkle × Big Bud", type: "indica", typeLabel: "Indica", color: "#3D2840", thc: 19, cbd: 0.1, dominant: "Myrcen",
    description: "Tief violett gefärbte Indica aus Kalifornien. Süss-traubiges Aroma mit deutlicher Beerennote. Klassische Wahl für die späten Abendstunden — ausgeprägt entspannende und einschläfernde Wirkung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 55 }, { name: "Pinen", aroma: "kiefernartig", value: 22 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 15 }, { name: "Linalool", aroma: "blumig, lavendel", value: 8 } ],
    effects: ["schläfrig", "entspannt", "hungrig", "schmerzlindernd"] },
  { id: 6, name: "Jack Herer", genetics: "Haze × Northern Lights × Shiva Skunk", type: "sativa", typeLabel: "Sativa", color: "#4F6238", thc: 20, cbd: 0.3, dominant: "Terpinolen",
    description: "Benannt nach dem Cannabis-Aktivisten und Autor. Komplexes Aroma mit Kiefer, Zitrus und einer würzigen Pfeffer-Note. Ungewöhnlich hoher Anteil Terpinolen — selten unter den weit verbreiteten Sorten.",
    terpenes: [ { name: "Terpinolen", aroma: "kräuterig, frisch", value: 45 }, { name: "Pinen", aroma: "kiefernartig", value: 25 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 18 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 12 } ],
    effects: ["kreativ", "euphorisch", "klar", "energiegeladen"] },
  { id: 7, name: "Blue Dream", genetics: "Blueberry × Haze", type: "hybrid", typeLabel: "Hybrid", color: "#3E4A5C", thc: 19, cbd: 0.2, dominant: "Myrcen",
    description: "Sativa-dominanter Hybrid aus Kalifornien. Sanftes, fruchtig-süsses Beerenaroma mit blumigen Nuancen. Gilt als sehr ausgewogene Sorte, geschätzt bei Patienten ohne Vorerfahrung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 42 }, { name: "Pinen", aroma: "kiefernartig", value: 28 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Linalool", aroma: "blumig, lavendel", value: 8 } ],
    effects: ["entspannt", "kreativ", "glücklich", "stimmungsaufhellend"] },
  { id: 8, name: "AC/DC", genetics: "Cannatonic Phänotyp", type: "cbd", typeLabel: "CBD-dominant", color: "#445C68", thc: 1, cbd: 17, dominant: "Myrcen",
    description: "Phänotyp der Sorte Cannatonic mit aussergewöhnlich hohem CBD- und sehr geringem THC-Gehalt. Erdig-süsses Aroma. Für Patienten, die die therapeutischen Effekte ohne psychoaktive Wirkung suchen.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 40 }, { name: "Pinen", aroma: "kiefernartig", value: 30 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Limonen", aroma: "zitrusartig", value: 8 } ],
    effects: ["klar", "ruhig", "fokussiert", "schmerzlindernd"] },
  { id: 9, name: "Harlequin", genetics: "Colombian Gold × Nepali × Thai × Swiss Sativa", type: "cbd", typeLabel: "CBD-dominant", color: "#2D5048", thc: 7, cbd: 12, dominant: "Myrcen",
    description: "CBD-dominante Sativa mit zuverlässigem 5:2 CBD-zu-THC-Verhältnis. Mango-artige Süsse mit erdiger Tiefe. Geschätzt für eine klare, fokussierte Wirkung bei minimaler Beeinträchtigung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 35 }, { name: "Pinen", aroma: "kiefernartig", value: 30 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 25 }, { name: "Humulen", aroma: "hopfig, holzig", value: 10 } ],
    effects: ["klar", "entspannt", "fokussiert", "schmerzlindernd"] },
  { id: 10, name: "Pineapple Express", genetics: "Trainwreck × Hawaiian", type: "hybrid", typeLabel: "Hybrid", color: "#8B6224", thc: 20, cbd: 0.3, dominant: "Caryophyllen",
    description: "Sativa-dominanter Hybrid mit unverwechselbarem tropisch-fruchtigem Aroma — Ananas, Mango und eine zedernholzartige Tiefe. Energetisch ausgleichend, ohne überstimulierend zu wirken.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 35 }, { name: "Limonen", aroma: "zitrusartig", value: 30 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 25 }, { name: "Pinen", aroma: "kiefernartig", value: 10 } ],
    effects: ["glücklich", "kreativ", "energiegeladen", "stimmungsaufhellend"] },
  { id: 11, name: "Hindu Kush", genetics: "Pakistanische Landrasse", type: "indica", typeLabel: "Indica", color: "#5A3548", thc: 17, cbd: 0.3, dominant: "Myrcen",
    description: "Reine Indica-Landrasse aus dem gleichnamigen Gebirge zwischen Pakistan und Afghanistan. Eine der genetischen Grundlagen vieler moderner Indica-Sorten. Würzig-süsses Sandelholz-Aroma mit hash-artiger Tiefe.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 50 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 25 }, { name: "Pinen", aroma: "kiefernartig", value: 15 }, { name: "Limonen", aroma: "zitrusartig", value: 10 } ],
    effects: ["entspannt", "schläfrig", "schmerzlindernd", "meditativ"] },
  { id: 12, name: "Afghan Kush", genetics: "Hindukusch-Phänotyp", type: "indica", typeLabel: "Indica", color: "#4D2C35", thc: 18, cbd: 0.4, dominant: "Myrcen",
    description: "Pure Indica aus der Hindukusch-Region Afghanistans. Ausgeprägt erdig-würziges Aroma mit deutlichen Kräuternoten. Klassische Wahl für tiefe körperliche Entspannung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 55 }, { name: "Pinen", aroma: "kiefernartig", value: 20 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 18 }, { name: "Limonen", aroma: "zitrusartig", value: 7 } ],
    effects: ["entspannt", "schläfrig", "appetitanregend", "schmerzlindernd"] },
  { id: 13, name: "Purple Punch", genetics: "Larry OG × Granddaddy Purple", type: "indica", typeLabel: "Indica", color: "#6B3145", thc: 19, cbd: 0.2, dominant: "Caryophyllen",
    description: "Dessert-Indica mit ausgeprägtem Traubenaroma und Vanille-Untertönen. Tiefviolett gefärbte Blüten. Geschätzt für die ausgleichende Wirkung — entspannend ohne sofort einschläfernd.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 35 }, { name: "Limonen", aroma: "zitrusartig", value: 28 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 22 }, { name: "Linalool", aroma: "blumig, lavendel", value: 15 } ],
    effects: ["entspannt", "glücklich", "schläfrig", "stimmungsaufhellend"] },
  { id: 14, name: "Bubba Kush", genetics: "OG Kush × unbekannte Indica", type: "indica", typeLabel: "Indica", color: "#3A2D45", thc: 19, cbd: 0.1, dominant: "Myrcen",
    description: "Schwere Indica mit Kaffee-Schokoladen-Aroma und erdiger Tiefe. Bekannt für die ausgeprägte einschläfernde Wirkung. Klassiker für die späten Abendstunden.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 48 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 25 }, { name: "Limonen", aroma: "zitrusartig", value: 15 }, { name: "Linalool", aroma: "blumig, lavendel", value: 12 } ],
    effects: ["schläfrig", "entspannt", "schmerzlindernd", "appetitanregend"] },
  { id: 15, name: "Master Kush", genetics: "Hindu Kush × Skunk #1", type: "indica", typeLabel: "Indica", color: "#3F2540", thc: 20, cbd: 0.2, dominant: "Myrcen",
    description: "Klassische Hash-Plant aus dem niederländischen Coffeeshop-Erbe. Erdig-zitruses Aroma mit harzig-süsser Tiefe. Bekannt für reichliche Trichom-Produktion.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 45 }, { name: "Limonen", aroma: "zitrusartig", value: 25 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 20 }, { name: "Pinen", aroma: "kiefernartig", value: 10 } ],
    effects: ["entspannt", "glücklich", "schläfrig", "kreativ"] },
  { id: 16, name: "Mazar I Sharif", genetics: "Afghanische Landrasse", type: "indica", typeLabel: "Indica", color: "#4F2D35", thc: 18, cbd: 0.5, dominant: "Myrcen",
    description: "Indica-Landrasse aus der Region um die afghanische Stadt Mazar-i-Sharif. Stark hash-orientiertes Aroma — würzig, erdig und harzig. Historisch eine der bedeutendsten Sorten für Hashish-Produktion.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 52 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Humulen", aroma: "hopfig, holzig", value: 14 }, { name: "Pinen", aroma: "kiefernartig", value: 12 } ],
    effects: ["entspannt", "meditativ", "schläfrig", "schmerzlindernd"] },
  { id: 17, name: "Durban Poison", genetics: "Südafrikanische Landrasse", type: "sativa", typeLabel: "Sativa", color: "#6B7A52", thc: 20, cbd: 0.2, dominant: "Terpinolen",
    description: "Pure Sativa-Landrasse aus dem südafrikanischen Hafen Durban. Markant süss-anisiges Aroma. Eine der wenigen weit verbreiteten reinen Sativas und Grundlage vieler moderner Hybrid-Sorten.",
    terpenes: [ { name: "Terpinolen", aroma: "kräuterig, frisch", value: 48 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 22 }, { name: "Pinen", aroma: "kiefernartig", value: 20 }, { name: "Ocimen", aroma: "süss, kräuterig", value: 10 } ],
    effects: ["energiegeladen", "kreativ", "klar", "stimmungsaufhellend"] },
  { id: 18, name: "Green Crack", genetics: "Skunk #1 Phänotyp", type: "sativa", typeLabel: "Sativa", color: "#4D5F3D", thc: 21, cbd: 0.2, dominant: "Myrcen",
    description: "Sehr energetische Sativa mit fruchtig-tropischem Mango-Aroma. Ursprünglich bekannt als Cush oder Green Cush. Geschätzt für ausgeprägte Tageszeit-Wirkung ohne dämpfenden Effekt.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 42 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 25 }, { name: "Pinen", aroma: "kiefernartig", value: 18 }, { name: "Limonen", aroma: "zitrusartig", value: 15 } ],
    effects: ["energiegeladen", "fokussiert", "kreativ", "gesprächig"] },
  { id: 19, name: "Super Lemon Haze", genetics: "Lemon Skunk × Super Silver Haze", type: "sativa", typeLabel: "Sativa", color: "#5F7048", thc: 22, cbd: 0.3, dominant: "Limonen",
    description: "Mehrfacher Cannabis-Cup-Gewinner mit unverwechselbar zitronigem Aroma. Ausgeprägte Sativa-Wirkung mit deutlich aufhellender und energetisierender Komponente.",
    terpenes: [ { name: "Limonen", aroma: "zitrusartig", value: 45 }, { name: "Terpinolen", aroma: "kräuterig, frisch", value: 25 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 18 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 12 } ],
    effects: ["energiegeladen", "euphorisch", "kreativ", "stimmungsaufhellend"] },
  { id: 20, name: "Strawberry Cough", genetics: "Strawberry Fields × Haze", type: "sativa", typeLabel: "Sativa", color: "#5A6E40", thc: 18, cbd: 0.3, dominant: "Myrcen",
    description: "Sativa mit ausgeprägtem süssen Erdbeer-Aroma und expandierender Wirkung beim Inhalieren — daher der Name. Geschätzt für klare, angstlösende Wirkung.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 40 }, { name: "Pinen", aroma: "kiefernartig", value: 30 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 20 }, { name: "Limonen", aroma: "zitrusartig", value: 10 } ],
    effects: ["klar", "stimmungsaufhellend", "kreativ", "gesprächig"] },
  { id: 21, name: "Amnesia Haze", genetics: "Haze × Afghan × Hawaiian", type: "sativa", typeLabel: "Sativa", color: "#586B40", thc: 22, cbd: 0.2, dominant: "Terpinolen",
    description: "Niederländischer Coffeeshop-Klassiker mit starker, einsetzender Wirkung. Komplexes Aroma mit Zitrus, Erde und süssen Untertönen. Anspruchsvolle Sativa mit langer Blütezeit.",
    terpenes: [ { name: "Terpinolen", aroma: "kräuterig, frisch", value: 38 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 25 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Pinen", aroma: "kiefernartig", value: 15 } ],
    effects: ["energiegeladen", "euphorisch", "kreativ", "gesprächig"] },
  { id: 22, name: "Girl Scout Cookies", genetics: "Durban Poison × OG Kush", type: "hybrid", typeLabel: "Hybrid", color: "#7A4E26", thc: 23, cbd: 0.2, dominant: "Caryophyllen",
    description: "Aus San Francisco stammende moderne Klassiker-Sorte. Komplexes Aroma mit süssen Bäckerei-Noten und Minze. Genetische Grundlage einer ganzen Generation moderner Hybriden.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 38 }, { name: "Limonen", aroma: "zitrusartig", value: 28 }, { name: "Humulen", aroma: "hopfig, holzig", value: 18 }, { name: "Linalool", aroma: "blumig, lavendel", value: 16 } ],
    effects: ["euphorisch", "entspannt", "glücklich", "kreativ"] },
  { id: 23, name: "Wedding Cake", genetics: "Triangle Kush × Animal Mints", type: "hybrid", typeLabel: "Hybrid", color: "#8F5230", thc: 25, cbd: 0.2, dominant: "Caryophyllen",
    description: "Indica-dominanter Dessert-Hybrid mit reichem Vanille-Bäckerei-Aroma. Hohe THC-Werte bei ausgeglichenem Effekt-Profil. Eine der gefragtesten modernen US-Sorten.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 35 }, { name: "Limonen", aroma: "zitrusartig", value: 28 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 22 }, { name: "Linalool", aroma: "blumig, lavendel", value: 15 } ],
    effects: ["entspannt", "euphorisch", "glücklich", "appetitanregend"] },
  { id: 24, name: "Gelato", genetics: "Sunset Sherbet × Thin Mint GSC", type: "hybrid", typeLabel: "Hybrid", color: "#6F3F1E", thc: 22, cbd: 0.2, dominant: "Caryophyllen",
    description: "Aus der Bay Area Familie der Cookies-Genetik. Süsses, dessertartiges Aroma mit Beerennoten und cremiger Tiefe. Visuell beeindruckend mit violetten und orangenen Akzenten.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 35 }, { name: "Limonen", aroma: "zitrusartig", value: 30 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 22 }, { name: "Linalool", aroma: "blumig, lavendel", value: 13 } ],
    effects: ["entspannt", "euphorisch", "kreativ", "glücklich"] },
  { id: 25, name: "Gorilla Glue", genetics: "Chem's Sister × Sour Dubb × Chocolate Diesel", type: "hybrid", typeLabel: "Hybrid", color: "#5C4A2F", thc: 26, cbd: 0.2, dominant: "Caryophyllen",
    description: "Auch bekannt als Original Glue oder GG4 nach Markenrechtsstreitigkeiten. Extrem hohe Trichom-Dichte mit deutlichem Diesel-Schokoladen-Aroma. Stark wirkende Genetik.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 42 }, { name: "Limonen", aroma: "zitrusartig", value: 25 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 18 }, { name: "Humulen", aroma: "hopfig, holzig", value: 15 } ],
    effects: ["entspannt", "euphorisch", "schläfrig", "glücklich"] },
  { id: 26, name: "Zkittlez", genetics: "Grape Ape × Grapefruit", type: "hybrid", typeLabel: "Hybrid", color: "#845A30", thc: 19, cbd: 0.3, dominant: "Caryophyllen",
    description: "Indica-dominanter Hybrid mit ausgeprägt süssem, fruchtig-bonbonartigem Aroma. Vielfacher Cannabis-Cup-Gewinner in der Indica-Kategorie. Ausgewogen wirkend trotz Indica-Dominanz.",
    terpenes: [ { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 32 }, { name: "Linalool", aroma: "blumig, lavendel", value: 25 }, { name: "Humulen", aroma: "hopfig, holzig", value: 22 }, { name: "Myrcen", aroma: "erdig, moschusartig", value: 21 } ],
    effects: ["entspannt", "glücklich", "klar", "stimmungsaufhellend"] },
  { id: 27, name: "Bruce Banner", genetics: "OG Kush × Strawberry Diesel", type: "hybrid", typeLabel: "Hybrid", color: "#5F4023", thc: 27, cbd: 0.2, dominant: "Myrcen",
    description: "Nach dem Alter Ego von Hulk benannt — schnell einsetzende, starke Wirkung. Sativa-dominanter Hybrid mit süss-erdig-dieselartigem Aroma. Eine der THC-stärksten weit verbreiteten Sorten.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 35 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 30 }, { name: "Limonen", aroma: "zitrusartig", value: 22 }, { name: "Pinen", aroma: "kiefernartig", value: 13 } ],
    effects: ["euphorisch", "kreativ", "energiegeladen", "glücklich"] },
  { id: 28, name: "Charlotte's Web", genetics: "Industrial Hemp × Cannabis-Genetik", type: "cbd", typeLabel: "CBD-dominant", color: "#3E5A60", thc: 0.3, cbd: 17, dominant: "Myrcen",
    description: "Nach Charlotte Figi benannt, deren Behandlung mit dieser Sorte wesentlich zur Anerkennung pädiatrischer CBD-Therapien beitrug. Sehr niedrig in THC, hoch in CBD. Erdig-holziges Aroma.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 35 }, { name: "Pinen", aroma: "kiefernartig", value: 30 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Bisabolol", aroma: "blumig, kamillig", value: 13 } ],
    effects: ["ruhig", "klar", "schmerzlindernd", "antiepileptisch"] },
  { id: 29, name: "Cannatonic", genetics: "MK Ultra × G13 Haze", type: "cbd", typeLabel: "CBD-dominant", color: "#2F4A4E", thc: 6, cbd: 14, dominant: "Myrcen",
    description: "Genetische Grundlage vieler CBD-dominanter Sorten, darunter AC/DC. Erdig-zitruses Aroma. Klassische Wahl für medizinische Patienten, die ein ausgeglichenes Cannabinoid-Profil mit therapeutischer Wirkung suchen.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 38 }, { name: "Pinen", aroma: "kiefernartig", value: 28 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 22 }, { name: "Limonen", aroma: "zitrusartig", value: 12 } ],
    effects: ["entspannt", "fokussiert", "schmerzlindernd", "klar"] },
  { id: 30, name: "Ringo's Gift", genetics: "AC/DC × Harlequin", type: "cbd", typeLabel: "CBD-dominant", color: "#50656D", thc: 4, cbd: 14, dominant: "Myrcen",
    description: "Nach dem CBD-Spezialisten Lawrence Ringo benannt. Sehr hoher CBD-Gehalt mit verschiedenen verfügbaren Phänotypen unterschiedlicher CBD-zu-THC-Verhältnisse. Sanft erdiges Aroma mit Kiefernoten.",
    terpenes: [ { name: "Myrcen", aroma: "erdig, moschusartig", value: 35 }, { name: "Pinen", aroma: "kiefernartig", value: 32 }, { name: "Caryophyllen", aroma: "pfeffrig, würzig", value: 20 }, { name: "Humulen", aroma: "hopfig, holzig", value: 13 } ],
    effects: ["klar", "ruhig", "fokussiert", "schmerzlindernd"] },
];

// =================== DEFENSIVE WRAPPERS ===================

class Bud3DErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("[Bud3D] Render error caught:", error);
  }
  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}

function ClientOnly({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? <>{children}</> : <>{fallback}</>;
}

// =================== HELPERS ===================

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise3D(x: number, y: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const u = smoothstep(fx);
  const v = smoothstep(fy);
  const w = smoothstep(fz);
  const h = (cx: number, cy: number, cz: number) =>
    pseudoRandom(seed + cx * 73.7 + cy * 19.3 + cz * 137.1) * 2 - 1;
  const c000 = h(ix, iy, iz);
  const c100 = h(ix + 1, iy, iz);
  const c010 = h(ix, iy + 1, iz);
  const c110 = h(ix + 1, iy + 1, iz);
  const c001 = h(ix, iy, iz + 1);
  const c101 = h(ix + 1, iy, iz + 1);
  const c011 = h(ix, iy + 1, iz + 1);
  const c111 = h(ix + 1, iy + 1, iz + 1);
  const x00 = c000 * (1 - u) + c100 * u;
  const x10 = c010 * (1 - u) + c110 * u;
  const x01 = c001 * (1 - u) + c101 * u;
  const x11 = c011 * (1 - u) + c111 * u;
  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;
  return y0 * (1 - w) + y1 * w;
}

function fbm(x: number, y: number, z: number, seed: number, octaves = 3): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    value += valueNoise3D(x * frequency, y * frequency, z * frequency, seed + i * 31) * amplitude;
    max += amplitude;
    amplitude *= 0.5;
    frequency *= 2.1;
  }
  return value / max;
}

function safeMergeGeometries(geos: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geos.length === 0) return null;
  try {
    let totalVerts = 0;
    let totalIndices = 0;
    for (const g of geos) {
      if (!g.attributes.position) return null;
      totalVerts += g.attributes.position.count;
      totalIndices += g.index ? g.index.count : g.attributes.position.count;
    }
    if (totalVerts === 0) return null;

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const colors = new Float32Array(totalVerts * 3);
    const indices = new Uint32Array(totalIndices);

    let vOffset = 0;
    let iOffset = 0;

    for (const g of geos) {
      const vCount = g.attributes.position.count;
      const posArr = g.attributes.position.array;
      for (let i = 0; i < vCount * 3; i++) {
        positions[vOffset * 3 + i] = posArr[i];
      }
      if (g.attributes.normal) {
        const normArr = g.attributes.normal.array;
        for (let i = 0; i < vCount * 3; i++) {
          normals[vOffset * 3 + i] = normArr[i];
        }
      }
      if (g.attributes.color) {
        const colArr = g.attributes.color.array;
        for (let i = 0; i < vCount * 3; i++) {
          colors[vOffset * 3 + i] = colArr[i];
        }
      }
      if (g.index) {
        const idxArr = g.index.array;
        for (let i = 0; i < g.index.count; i++) {
          indices[iOffset + i] = idxArr[i] + vOffset;
        }
        iOffset += g.index.count;
      }
      vOffset += vCount;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    merged.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    merged.setIndex(new THREE.BufferAttribute(indices, 1));
    return merged;
  } catch (e) {
    console.error("[safeMergeGeometries] Failed:", e);
    return null;
  }
}

function rotationFromDir(dir: THREE.Vector3): [number, number, number] {
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

function makeCannabisLeafShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.05, 0.05, 0.18, 0.08, 0.22, 0.18);
  shape.quadraticCurveTo(0.2, 0.22, 0.15, 0.22);
  shape.bezierCurveTo(0.2, 0.28, 0.3, 0.36, 0.32, 0.48);
  shape.quadraticCurveTo(0.28, 0.51, 0.22, 0.49);
  shape.bezierCurveTo(0.22, 0.58, 0.22, 0.7, 0.18, 0.82);
  shape.quadraticCurveTo(0.13, 0.83, 0.09, 0.82);
  shape.bezierCurveTo(0.06, 0.88, 0.03, 0.95, 0, 1.0);
  shape.bezierCurveTo(-0.03, 0.95, -0.06, 0.88, -0.09, 0.82);
  shape.quadraticCurveTo(-0.13, 0.83, -0.18, 0.82);
  shape.bezierCurveTo(-0.22, 0.7, -0.22, 0.58, -0.22, 0.49);
  shape.quadraticCurveTo(-0.28, 0.51, -0.32, 0.48);
  shape.bezierCurveTo(-0.3, 0.36, -0.2, 0.28, -0.15, 0.22);
  shape.quadraticCurveTo(-0.2, 0.22, -0.22, 0.18);
  shape.bezierCurveTo(-0.18, 0.08, -0.05, 0.05, 0, 0);
  return shape;
}

// =================== PHENOTYPE ===================

type Phenotype = {
  type: "indica" | "sativa" | "hybrid" | "cbd";
  elongation: number;
  taper: number;
  bumpStrength: number;
  asymmetry: number;
  pistilCount: number;
  pistilLength: number;
  pistilThickness: number;
  pistilWhiteRatio: number;
  pistilHue: number;
  pistilCurve: number;
  trichomeCount: number;
  trichomeSize: number;
  trichomeGlow: number;
  baseGreen: THREE.Color;
  darkGreen: THREE.Color;
  bumpHighlight: THREE.Color;
  darkCrevice: THREE.Color;
  purpleHint: number;
  yellowHint: number;
  whiteHint: number;
  calyxCount: number;
  sugarLeafCount: number;
  seed: number;
};

function getPhenotype(strain: Strain): Phenotype {
  const seed = strain.id * 17.31 + 0.5;
  const r = (n: number) => pseudoRandom(seed + n);
  const t = strain.type;
  const isIndica = t === "indica";
  const isSativa = t === "sativa";
  const isCBD = t === "cbd";
  const nameKey = (strain.name + " " + strain.genetics).toLowerCase();
  const isPurple = /(purple|granddaddy|blueberry|zkittlez|grape|gelato)/.test(nameKey);
  const isLemon = /(lemon|haze)/.test(nameKey);
  const isWhite = /(white|silver|frost|wedding|gorilla|glue)/.test(nameKey);
  const isOrange = /(diesel|sour|tangie|orange)/.test(nameKey);

  const greenH = isSativa ? 0.27 : isCBD ? 0.28 : isIndica ? 0.23 : 0.26;
  const greenS = isSativa ? 0.55 : isCBD ? 0.42 : 0.5;
  const greenL = isSativa ? 0.33 : isIndica ? 0.22 : isCBD ? 0.36 : 0.28;
  const baseGreen = new THREE.Color().setHSL(greenH, greenS, greenL);
  const darkGreen = new THREE.Color().setHSL(greenH, greenS * 1.1, Math.max(0.05, greenL - 0.12));
  const bumpHighlight = new THREE.Color().setHSL(greenH, greenS * 0.65, Math.min(0.62, greenL + 0.27));
  const darkCrevice = new THREE.Color().setHSL(greenH, greenS * 0.9, Math.max(0.05, greenL - 0.16));

  // Calyx count: indica = dense (more calyces), sativa = looser (fewer)
  const calyxCount = isIndica
    ? 30 + Math.floor(r(30) * 6)  // 30-36
    : isSativa
    ? 24 + Math.floor(r(30) * 4)  // 24-28
    : 26 + Math.floor(r(30) * 6); // 26-32

  return {
    type: t,
    elongation: isSativa ? 1.45 + r(1) * 0.3 : isIndica ? 1.05 + r(1) * 0.15 : 1.25 + r(1) * 0.2,
    taper: isSativa ? 0.28 + r(2) * 0.08 : 0.16 + r(2) * 0.08,
    bumpStrength: 1.1 + r(4) * 0.4,
    asymmetry: 0.08 + r(5) * 0.1,
    pistilCount: Math.floor(35 + r(6) * 25),
    pistilLength: 0.18 + r(7) * 0.15,
    pistilThickness: 0.005 + r(8) * 0.003,
    pistilWhiteRatio: isOrange ? 0.05 + r(9) * 0.1 : 0.15 + r(9) * 0.2,
    pistilHue: 0.045 + r(10) * 0.05,
    pistilCurve: 0.55 + r(11) * 0.45,
    trichomeCount: isWhite ? Math.floor(220 + r(12) * 100) : Math.floor(140 + r(12) * 80),
    trichomeSize: 0.011 + r(13) * 0.005,
    trichomeGlow: isWhite ? 0.85 + r(14) * 0.3 : 0.6 + r(14) * 0.3,
    baseGreen,
    darkGreen,
    bumpHighlight,
    darkCrevice,
    purpleHint: isPurple ? 0.6 + r(15) * 0.25 : isIndica ? 0.08 + r(15) * 0.12 : 0,
    yellowHint: isLemon ? 0.18 + r(16) * 0.1 : 0.04 + r(16) * 0.04,
    whiteHint: isWhite ? 0.22 + r(17) * 0.1 : 0,
    calyxCount,
    sugarLeafCount: Math.floor(4 + r(20) * 4),
    seed,
  };
}

// =================== INNER BUD CORE (hides gaps between calyces) ===================

function buildInnerBudCore(pheno: Phenotype): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(0.78, 4);
  const positions = geo.attributes.position;
  const colors: number[] = [];

  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);
    y *= pheno.elongation;
    const yNorm = y / pheno.elongation;
    const taperFactor = yNorm > 0 ? 1 - yNorm * pheno.taper : 1 + Math.abs(yNorm) * 0.06;
    x *= taperFactor;
    z *= taperFactor;
    const lean = Math.sin(yNorm * 1.5 + pheno.seed) * pheno.asymmetry;
    x += lean * Math.cos(pheno.seed);
    z += lean * Math.sin(pheno.seed);

    // Mild FBM displacement (less than calyces — this is the BACKGROUND layer)
    const noise = fbm(x * 1.5, y * 1.1, z * 1.5, pheno.seed, 3) * 0.06;
    const dist = Math.max(0.0001, Math.sqrt(x * x + y * y + z * z));
    const scale = (dist + noise) / dist;
    positions.setX(i, x * scale);
    positions.setY(i, y * scale);
    positions.setZ(i, z * scale);

    // Color: dark green (this is the SHADOW/BACKGROUND under calyces)
    const c = pheno.darkGreen.clone();
    const variation = pseudoRandom(i * 3.456 + pheno.seed);
    c.multiplyScalar(0.65 + variation * 0.35);
    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// =================== CALYX BUILDERS ===================

type CalyxData = {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
  geometry: THREE.BufferGeometry;
  worldCenter: THREE.Vector3;
  worldOutDir: THREE.Vector3;
  transformMatrix: THREE.Matrix4;
  // y-position in [-1, 1] cluster space (for trichome density/pistil placement decisions)
  clusterY: number;
};

function buildCalyxGeometry(seed: number, tintColor: THREE.Color): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 2); // 162 verts — lightweight
  const positions = geo.attributes.position;
  const colors: number[] = [];

  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Egg-shape: elongate towards +Y (the outward-facing tip), narrower at tip
    y *= 1.3;
    const yNorm = y / 1.3;
    if (yNorm > 0.2) {
      const taper = 1 - (yNorm - 0.2) * 0.45;
      x *= taper;
      z *= taper;
    } else if (yNorm < -0.3) {
      // Slightly wider at base
      const widen = 1 + (yNorm + 0.3) * (yNorm + 0.3) * 0.15;
      x *= widen;
      z *= widen;
    }

    // Surface noise — subtle, gives each calyx individual character
    const angle = Math.atan2(z, x);
    const noise = Math.sin(angle * 5 + y * 3 + seed) * 0.04
                + Math.cos(angle * 7 - y * 5 + seed * 2) * 0.025
                + (pseudoRandom(seed + i * 7.3) - 0.5) * 0.025;

    const dist = Math.max(0.0001, Math.sqrt(x * x + y * y + z * z));
    const scale = (dist + noise) / dist;
    positions.setX(i, x * scale);
    positions.setY(i, y * scale);
    positions.setZ(i, z * scale);

    // Vertex color: darker at base (towards bud center), lighter at tip
    const yPos = positions.getY(i);
    const shadeFactor = 0.72 + ((yPos + 1.3) / 2.6) * 0.55;
    colors.push(tintColor.r * shadeFactor, tintColor.g * shadeFactor, tintColor.b * shadeFactor);
  }

  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

function buildCalyxCluster(pheno: Phenotype): CalyxData[] {
  const calyces: CalyxData[] = [];
  const purpleColor = new THREE.Color("#3a1f48");
  const yellowGreen = new THREE.Color("#9aa648");
  const whiteish = new THREE.Color("#c8d4b8");
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < pheno.calyxCount; i++) {
    const s = pheno.seed + i * 31.7;
    const t = i / Math.max(1, pheno.calyxCount - 1);

    // Y in [-1, 1] (top to bottom of cluster)
    let y = 1 - 2 * t + (pseudoRandom(s) - 0.5) * 0.1;
    y = Math.max(-1, Math.min(1, y));

    const baseR = Math.sqrt(Math.max(0, 1 - y * y));
    const angle = goldenAngle * i + (pseudoRandom(s + 1) - 0.5) * 0.3;

    // Taper (narrower at top for sativa)
    const taperFactor = y > 0 ? 1 - y * pheno.taper : 1 + Math.abs(y) * 0.05;
    const rTapered = baseR * taperFactor;
    const radiusVariation = 1 + (pseudoRandom(s + 2) - 0.5) * 0.1;

    const x = Math.cos(angle) * rTapered * radiusVariation;
    const z = Math.sin(angle) * rTapered * radiusVariation;
    const yPos = y * pheno.elongation;

    // Outward direction (Y of calyx points away from bud center, biased upward)
    const outDir = new THREE.Vector3(x, yPos * 0.45 + 0.08, z).normalize();

    // Calyx size — larger at top (real cola tip has bigger calyces)
    const topBoost = y > 0 ? 1 + y * 0.22 : 1 - Math.abs(y) * 0.12;
    const baseScale = (0.24 + pseudoRandom(s + 3) * 0.08) * topBoost;
    const scaleVar = pseudoRandom(s + 4);
    const scaleXZ = baseScale * (0.85 + scaleVar * 0.25);
    const scaleY = baseScale * (1.0 + pseudoRandom(s + 5) * 0.3);

    // Color tint per calyx
    let calyxColor = pheno.baseGreen.clone();
    calyxColor.offsetHSL(
      (pseudoRandom(s + 6) - 0.5) * 0.04,
      (pseudoRandom(s + 7) - 0.5) * 0.15,
      (pseudoRandom(s + 8) - 0.5) * 0.12
    );
    if (pheno.purpleHint > 0) {
      const purpleAmt = pheno.purpleHint * (0.3 + pseudoRandom(s + 9) * 0.7);
      const heightBoost = y > 0.3 ? 1.4 : (y > -0.2 ? 0.8 : 0.4);
      calyxColor.lerp(purpleColor, purpleAmt * 0.55 * heightBoost);
    }
    if (pheno.yellowHint > 0 && pseudoRandom(s + 10) > 0.55) {
      calyxColor.lerp(yellowGreen, pheno.yellowHint * 0.4);
    }
    if (pheno.whiteHint > 0 && pseudoRandom(s + 11) > 0.7) {
      calyxColor.lerp(whiteish, pheno.whiteHint * 0.25);
    }
    const lightness = 0.85 + pseudoRandom(s + 12) * 0.3;
    calyxColor.multiplyScalar(lightness);

    const geometry = buildCalyxGeometry(s + 7000, calyxColor);

    const position: [number, number, number] = [x, yPos, z];
    const scale: [number, number, number] = [scaleXZ, scaleY, scaleXZ];
    const rotation = rotationFromDir(outDir);

    const transformMatrix = new THREE.Matrix4().compose(
      new THREE.Vector3(...position),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
      new THREE.Vector3(...scale)
    );

    calyces.push({
      position,
      scale,
      rotation,
      geometry,
      worldCenter: new THREE.Vector3(...position),
      worldOutDir: outDir,
      transformMatrix,
      clusterY: y,
    });
  }

  return calyces;
}

// =================== WORLD-SPACE FEATURE GENERATORS ===================

function buildCurvedPistilGeometry(
  surfacePos: THREE.Vector3,
  outDirection: THREE.Vector3,
  length: number,
  thickness: number,
  curveAmount: number,
  upBias: number,
  seed: number
): THREE.BufferGeometry {
  const tempSide = new THREE.Vector3(
    pseudoRandom(seed * 7) - 0.5,
    pseudoRandom(seed * 11) - 0.5,
    pseudoRandom(seed * 13) - 0.5
  );
  const side = new THREE.Vector3().crossVectors(outDirection, tempSide).normalize();

  const p0 = surfacePos.clone();
  const p1 = surfacePos.clone().add(outDirection.clone().multiplyScalar(length * 0.3));
  const p2 = surfacePos.clone()
    .add(outDirection.clone().multiplyScalar(length * 0.6))
    .add(side.clone().multiplyScalar(curveAmount * length * 0.3))
    .add(new THREE.Vector3(0, length * 0.12, 0));
  const p3 = surfacePos.clone()
    .add(outDirection.clone().multiplyScalar(length * 0.9))
    .add(side.clone().multiplyScalar(curveAmount * length * 0.5))
    .add(new THREE.Vector3(0, length * upBias, 0));

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
  return new THREE.TubeGeometry(curve, 8, thickness, 5, false);
}

type InstanceData = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: THREE.Color;
};

type LeafData = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
};

type BudFeatures = {
  mergedPistilGeometry: THREE.BufferGeometry | null;
  conePistilFallback: InstanceData[];
  trichomeStalks: InstanceData[];
  trichomeHeads: InstanceData[];
  leaves: LeafData[];
};

function generateBudFeatures(pheno: Phenotype, calyces: CalyxData[]): BudFeatures {
  const pistilTubes: THREE.BufferGeometry[] = [];
  const conePistilFallback: InstanceData[] = [];
  const trichomeStalks: InstanceData[] = [];
  const trichomeHeads: InstanceData[] = [];
  const leaves: LeafData[] = [];

  // === PISTILS: only from top quarter of cluster, emerging between calyces ===
  // Filter to upper calyces only (clusterY > 0.2)
  const upperCalyces = calyces.filter((c) => c.clusterY > 0.2);
  const pistilSampleCount = Math.min(pheno.pistilCount, upperCalyces.length * 3);

  for (let i = 0; i < pistilSampleCount; i++) {
    const s = pheno.seed + i * 7.89 + 5000;
    // Pick a random upper calyx as the pistil's origin
    const calyx = upperCalyces[Math.floor(pseudoRandom(s) * upperCalyces.length)];
    if (!calyx) continue;

    // Pistil emerges from near the TIP of the calyx (the outward-pointing end)
    // In calyx local space, tip is around (0, 1, 0). Slight randomness.
    const tipLocalY = 0.9 + pseudoRandom(s + 1) * 0.3;
    const tipLocalX = (pseudoRandom(s + 2) - 0.5) * 0.3;
    const tipLocalZ = (pseudoRandom(s + 3) - 0.5) * 0.3;
    const localTip = new THREE.Vector3(tipLocalX, tipLocalY, tipLocalZ);
    const worldTip = localTip.clone().applyMatrix4(calyx.transformMatrix);

    // Outward direction: calyx's outward direction + upward bias
    const outDir = new THREE.Vector3(
      calyx.worldOutDir.x * 0.6,
      calyx.worldOutDir.y * 0.5 + 0.7, // strong upward bias
      calyx.worldOutDir.z * 0.6
    ).normalize();

    const length = pheno.pistilLength * (0.55 + pseudoRandom(s + 4) * 0.7);
    const thickness = pheno.pistilThickness * (0.7 + pseudoRandom(s + 5) * 0.6);
    const curve = pheno.pistilCurve * (0.4 + pseudoRandom(s + 6) * 1.0);
    const upBias = 0.3 + pseudoRandom(s + 7) * 0.3;

    // Color bucket (pistil color variation)
    const t = pseudoRandom(s + 8);
    let color: THREE.Color;
    if (t < pheno.pistilWhiteRatio) {
      color = new THREE.Color().setHSL(0.13, 0.18, 0.86);
    } else if (t < pheno.pistilWhiteRatio + 0.45) {
      const hue = pheno.pistilHue + 0.015 + (pseudoRandom(s + 9) - 0.5) * 0.02;
      color = new THREE.Color().setHSL(hue, 0.78, 0.55);
    } else if (t < pheno.pistilWhiteRatio + 0.85) {
      const hue = pheno.pistilHue + (pseudoRandom(s + 10) - 0.5) * 0.025;
      color = new THREE.Color().setHSL(hue, 0.85, 0.42);
    } else {
      const hue = pheno.pistilHue - 0.015 + (pseudoRandom(s + 11) - 0.5) * 0.02;
      color = new THREE.Color().setHSL(hue, 0.88, 0.3);
    }

    try {
      const tube = buildCurvedPistilGeometry(worldTip, outDir, length, thickness, curve, upBias, s);
      const vCount = tube.attributes.position.count;
      const colorArr = new Float32Array(vCount * 3);
      for (let v = 0; v < vCount; v++) {
        colorArr[v * 3] = color.r;
        colorArr[v * 3 + 1] = color.g;
        colorArr[v * 3 + 2] = color.b;
      }
      tube.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));
      pistilTubes.push(tube);
    } catch (e) {
      // Fallback handled below
    }

    // Cone fallback (always built for safety)
    const cx = worldTip.x + outDir.x * length * 0.5;
    const cy = worldTip.y + outDir.y * length * 0.5;
    const cz = worldTip.z + outDir.z * length * 0.5;
    conePistilFallback.push({
      position: [cx, cy, cz],
      rotation: rotationFromDir(outDir),
      scale: [thickness, length, thickness],
      color,
    });
  }

  const mergedPistilGeometry = pistilTubes.length > 0 ? safeMergeGeometries(pistilTubes) : null;

  // === TRICHOMES: distributed across ALL calyces' surfaces ===
  // For each calyx, sample N random points on its surface and emit trichome there
  const trichomesPerCalyx = Math.max(3, Math.floor(pheno.trichomeCount / calyces.length));

  for (let cIdx = 0; cIdx < calyces.length; cIdx++) {
    const calyx = calyces[cIdx];
    for (let i = 0; i < trichomesPerCalyx; i++) {
      const s = pheno.seed + cIdx * 1000 + i * 2.7183 + 10000;

      // Random point on unit sphere (calyx local space)
      const theta = pseudoRandom(s) * Math.PI * 2;
      // Bias toward outward-facing surface (positive Y in calyx local space)
      const cosPhi = pseudoRandom(s + 1) * 1.5 - 0.5;
      const phi = Math.acos(Math.max(-1, Math.min(1, cosPhi)));
      const localX = Math.sin(phi) * Math.cos(theta);
      const localY = Math.cos(phi);
      const localZ = Math.sin(phi) * Math.sin(theta);

      // Transform to world space
      const localSurface = new THREE.Vector3(localX, localY * 1.3, localZ); // account for egg-shape
      const worldSurface = localSurface.clone().applyMatrix4(calyx.transformMatrix);

      // Outward direction in world space (calyx normal at this point)
      const worldNormal = localSurface.clone().normalize()
        .applyMatrix3(new THREE.Matrix3().setFromMatrix4(calyx.transformMatrix))
        .normalize();

      // Tangential tilt (trichomes lie along surface)
      const tempT = new THREE.Vector3(
        pseudoRandom(s + 2) - 0.5,
        pseudoRandom(s + 3) - 0.5,
        pseudoRandom(s + 4) - 0.5
      );
      const tangent = new THREE.Vector3().crossVectors(worldNormal, tempT).normalize();
      const tiltAmount = 0.6 + pseudoRandom(s + 5) * 0.7;
      const tiltQ = new THREE.Quaternion().setFromAxisAngle(tangent, tiltAmount);
      const trichDir = worldNormal.clone().applyQuaternion(tiltQ);

      const stalkLength = pheno.trichomeSize * (1.0 + pseudoRandom(s + 6) * 0.5);
      const stalkThickness = pheno.trichomeSize * 0.3;
      const headSize = pheno.trichomeSize * (0.7 + pseudoRandom(s + 7) * 0.35);

      trichomeStalks.push({
        position: [
          worldSurface.x + trichDir.x * stalkLength * 0.5,
          worldSurface.y + trichDir.y * stalkLength * 0.5,
          worldSurface.z + trichDir.z * stalkLength * 0.5,
        ],
        rotation: rotationFromDir(trichDir),
        scale: [stalkThickness, stalkLength, stalkThickness],
      });

      trichomeHeads.push({
        position: [
          worldSurface.x + trichDir.x * (stalkLength + headSize * 0.5),
          worldSurface.y + trichDir.y * (stalkLength + headSize * 0.5),
          worldSurface.z + trichDir.z * (stalkLength + headSize * 0.5),
        ],
        rotation: rotationFromDir(trichDir),
        scale: [headSize, headSize * 1.4, headSize],
      });
    }
  }

  // === SUGAR LEAVES: small leaves embedded between calyces in mid-cluster ===
  // Pick random calyces from middle region (clusterY between -0.3 and 0.7)
  const midCalyces = calyces.filter((c) => c.clusterY > -0.3 && c.clusterY < 0.7);

  for (let i = 0; i < pheno.sugarLeafCount; i++) {
    const sl = pheno.seed + i * 13.7 + 20000;
    if (midCalyces.length === 0) break;
    const calyx = midCalyces[Math.floor(pseudoRandom(sl) * midCalyces.length)];

    // Leaf positioned at calyx base (negative Y in calyx local space)
    const baseLocalY = -0.4 + pseudoRandom(sl + 1) * 0.5;
    const baseLocalX = (pseudoRandom(sl + 2) - 0.5) * 0.6;
    const baseLocalZ = (pseudoRandom(sl + 3) - 0.5) * 0.6;
    const localBase = new THREE.Vector3(baseLocalX, baseLocalY * 1.3, baseLocalZ);
    const worldBase = localBase.clone().applyMatrix4(calyx.transformMatrix);

    // Leaf direction: outward from calyx but more sideways
    const sideOffset = new THREE.Vector3(baseLocalX, 0, baseLocalZ).normalize();
    const worldSide = sideOffset.clone()
      .applyMatrix3(new THREE.Matrix3().setFromMatrix4(calyx.transformMatrix))
      .normalize();

    // Leaf normal (back of leaf faces outward)
    const leafNormal = worldSide.clone().multiplyScalar(0.7)
      .add(calyx.worldOutDir.clone().multiplyScalar(0.3))
      .normalize();

    const defaultNormal = new THREE.Vector3(0, 0, 1);
    const alignQ = new THREE.Quaternion().setFromUnitVectors(defaultNormal, leafNormal);
    const spinAngle = pseudoRandom(sl + 4) * Math.PI * 2;
    const spinQ = new THREE.Quaternion().setFromAxisAngle(leafNormal, spinAngle);
    const finalQ = spinQ.multiply(alignQ);
    const euler = new THREE.Euler().setFromQuaternion(finalQ);
    const scl = 0.18 + pseudoRandom(sl + 5) * 0.12;

    leaves.push({
      position: [worldBase.x, worldBase.y, worldBase.z],
      rotation: [euler.x, euler.y, euler.z],
      scale: scl,
    });
  }

  return { mergedPistilGeometry, conePistilFallback, trichomeStalks, trichomeHeads, leaves };
}

// =================== COMPONENTS ===================

function Bud({ strain }: { strain: Strain }) {
  const groupRef = useRef<THREE.Group>(null);

  const built = useMemo(() => {
    try {
      const ph = getPhenotype(strain);
      const core = buildInnerBudCore(ph);
      const calyces = buildCalyxCluster(ph);
      const features = generateBudFeatures(ph, calyces);
      return { pheno: ph, core, calyces, features, ok: true as const };
    } catch (e) {
      console.error("[Bud] Build failed:", e);
      return { pheno: null, core: null, calyces: [], features: null, ok: false as const };
    }
  }, [strain]);

  const leafShape = useMemo(() => makeCannabisLeafShape(), []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.13;
    }
  });

  if (!built.ok || !built.pheno || !built.core || !built.features) {
    return (
      <group ref={groupRef}>
        <mesh>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#4a6b3a" roughness={0.6} />
        </mesh>
      </group>
    );
  }

  const { pheno, core, calyces, features } = built;

  return (
    <group ref={groupRef} position={[0, 0.1, 0]} scale={0.78}>
      {/* === STEM === */}
      <mesh position={[0, -pheno.elongation - 0.35, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 0.5, 12]} />
        <meshStandardMaterial color="#5a4225" roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[0, -pheno.elongation - 0.05, 0]}>
        <sphereGeometry args={[0.1, 14, 10]} />
        <meshStandardMaterial color="#7b5e35" roughness={0.8} />
      </mesh>

      {/* === INNER BUD CORE (hides gaps, shadow layer) === */}
      <mesh geometry={core}>
        <meshStandardMaterial vertexColors roughness={0.7} metalness={0.02} />
      </mesh>

      {/* === CALYX CLUSTER (the actual visible "popcorn" structure) === */}
      {calyces.map((c, i) => (
        <mesh
          key={`calyx-${i}`}
          geometry={c.geometry}
          position={c.position}
          rotation={c.rotation}
          scale={c.scale}
        >
          <meshPhysicalMaterial
            vertexColors
            roughness={0.45}
            metalness={0.04}
            clearcoat={0.4}
            clearcoatRoughness={0.5}
          />
        </mesh>
      ))}

      {/* === SUGAR LEAVES === */}
      {features.leaves.map((l, i) => (
        <mesh
          key={`leaf-${i}`}
          position={l.position}
          rotation={l.rotation}
          scale={[l.scale, l.scale, l.scale]}
        >
          <shapeGeometry args={[leafShape]} />
          <meshPhysicalMaterial
            color={pheno.baseGreen.clone().multiplyScalar(1.2)}
            roughness={0.55}
            metalness={0.03}
            clearcoat={0.4}
            clearcoatRoughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* === CURVED PISTILS (merged TubeGeometry or cone fallback) === */}
      {features.mergedPistilGeometry ? (
        <mesh geometry={features.mergedPistilGeometry}>
          <meshStandardMaterial vertexColors roughness={0.65} metalness={0.0} />
        </mesh>
      ) : features.conePistilFallback.length > 0 ? (
        <Instances limit={Math.max(80, features.conePistilFallback.length)} range={features.conePistilFallback.length}>
          <coneGeometry args={[1, 1, 6]} />
          <meshStandardMaterial roughness={0.65} metalness={0.0} />
          {features.conePistilFallback.map((p, i) => (
            <Instance
              key={i}
              position={p.position}
              rotation={p.rotation}
              scale={p.scale}
              color={p.color}
            />
          ))}
        </Instances>
      ) : null}

      {/* === TRICHOME STALKS === */}
      {features.trichomeStalks.length > 0 && (
        <Instances limit={Math.max(400, features.trichomeStalks.length)} range={features.trichomeStalks.length}>
          <coneGeometry args={[1, 1, 5]} />
          <meshStandardMaterial
            color="#e8e0c0"
            roughness={0.4}
            metalness={0.15}
            emissive="#fff4c0"
            emissiveIntensity={0.2}
          />
          {features.trichomeStalks.map((t, i) => (
            <Instance key={i} position={t.position} rotation={t.rotation} scale={t.scale} />
          ))}
        </Instances>
      )}

      {/* === TRICHOME HEADS — polished resin look (no transmission) === */}
      {features.trichomeHeads.length > 0 && (
        <Instances limit={Math.max(400, features.trichomeHeads.length)} range={features.trichomeHeads.length}>
          <capsuleGeometry args={[1, 1.0, 3, 5]} />
          <meshPhysicalMaterial
            color="#fff8e0"
            roughness={0.04}
            metalness={0.85}
            clearcoat={1.0}
            clearcoatRoughness={0.08}
            emissive="#fff8c0"
            emissiveIntensity={pheno.trichomeGlow * 0.65}
          />
          {features.trichomeHeads.map((t, i) => (
            <Instance key={i} position={t.position} rotation={t.rotation} scale={t.scale} />
          ))}
        </Instances>
      )}
    </group>
  );
}

function BudViewer({ strain }: { strain: Strain }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 5.8], fov: 38 }}
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        const handleLost = (e: Event) => {
          e.preventDefault();
          console.warn("[WebGL] Context lost");
        };
        const handleRestored = () => {
          console.log("[WebGL] Context restored");
        };
        canvas.addEventListener("webglcontextlost", handleLost);
        canvas.addEventListener("webglcontextrestored", handleRestored);
      }}
    >
      <Suspense fallback={null}>
        <Environment preset="forest" background={false} />
        <directionalLight position={[5, 8, 5]} intensity={1.6} color="#fff6e3" />
        <directionalLight position={[-5, 4, -3]} intensity={0.8} color="#a8c4ff" />
        <directionalLight position={[0, -2, 4]} intensity={0.5} color="#ffd9a8" />
        <pointLight position={[3, 4, 2]} intensity={0.55} color="#ffffff" distance={12} />
        <pointLight position={[-2, 2, 3]} intensity={0.35} color="#e8f0ff" distance={10} />
        <ambientLight intensity={0.3} />
        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.2}>
          <Bud strain={strain} />
        </Float>
        <ContactShadows position={[0, -1.8, 0]} opacity={0.55} blur={2.8} far={3} scale={4} color="#000000" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 1.6}
        />
      </Suspense>
    </Canvas>
  );
}

function StaticBudFallback({ strain }: { strain: Strain }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `radial-gradient(circle at 50% 40%, ${strain.color}aa 0%, ${strain.color}66 70%)`,
      }}
    >
      <div
        style={{
          fontFamily: "var(--display, serif)",
          fontStyle: "italic",
          fontSize: 28,
          color: "rgba(255,255,255,0.85)",
          textAlign: "center",
          padding: 24,
          letterSpacing: "-0.01em",
        }}
      >
        {strain.name}
        <div style={{ fontFamily: "var(--mono, monospace)", fontSize: 10, marginTop: 12, opacity: 0.6, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          3D-Vorschau nicht verfügbar
        </div>
      </div>
    </div>
  );
}

// =================== MAIN PAGE ===================

export default function Home() {
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Strain | null>(null);

  const filtered = strains.filter((s) => {
    const matchesType = filter === "all" || s.type === filter;
    if (!matchesType) return false;
    if (search.trim() === "") return true;
    const q = search.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      s.genetics.toLowerCase().includes(q) ||
      s.dominant.toLowerCase().includes(q) ||
      s.typeLabel.toLowerCase().includes(q) ||
      s.effects.some((e) => e.toLowerCase().includes(q)) ||
      s.terpenes.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [selected]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..700,0..100;1,9..144,300..700,0..100&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        :root {
          --cream: #F4EFE5; --cream-dark: #E8E1D2; --ink: #1A1A18; --ink-soft: #4A4842; --ink-mute: #8B887E;
          --forest: #1F3520; --copper: #8B4513; --paper: #FAF7EE;
          --line: rgba(26, 26, 24, 0.12); --line-strong: rgba(26, 26, 24, 0.25);
          --display: 'Fraunces', Georgia, serif;
          --sans: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
          --mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body {
          font-family: var(--sans); background: var(--cream); color: var(--ink);
          font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased;
          background-image: radial-gradient(at 12% 18%, rgba(139, 69, 19, 0.04) 0px, transparent 50%), radial-gradient(at 88% 72%, rgba(31, 53, 32, 0.05) 0px, transparent 50%);
          min-height: 100vh; overflow-x: hidden;
        }
        .container { max-width: 1240px; margin: 0 auto; padding: 0 32px; position: relative; z-index: 2; }
        header { padding: 28px 0; border-bottom: 1px solid var(--line); position: relative; z-index: 10; }
        .header-inner { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
        .brand { display: flex; align-items: baseline; gap: 10px; }
        .brand-mark { font-family: var(--display); font-style: italic; font-size: 24px; letter-spacing: -0.01em; color: var(--ink); }
        .brand-mark span { font-style: normal; font-weight: 300; color: var(--copper); }
        .brand-tag { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); }
        nav ul { display: flex; gap: 36px; list-style: none; }
        nav a { font-size: 13px; color: var(--ink-soft); text-decoration: none; letter-spacing: 0.02em; padding: 4px 0; transition: color 0.25s ease; }
        nav a:hover { color: var(--forest); }
        .header-meta { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); }
        .hero { padding: 96px 0 80px; position: relative; }
        .hero-eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--copper); margin-bottom: 32px; display: flex; align-items: center; gap: 16px; }
        .hero-eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--copper); }
        .hero h1 { font-family: var(--display); font-weight: 300; font-size: clamp(36px, 7vw, 88px); line-height: 1.05; letter-spacing: -0.025em; max-width: 950px; font-variation-settings: "SOFT" 50, "opsz" 144; }
        .hero h1 em { font-style: italic; font-weight: 300; color: var(--forest); }
        .hero-meta { margin-top: 48px; display: flex; gap: 64px; flex-wrap: wrap; padding-top: 32px; border-top: 1px solid var(--line); max-width: 720px; }
        .hero-meta-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); }
        .hero-meta-value { font-family: var(--display); font-size: 22px; font-style: italic; }
        .filter-section { padding: 24px 0; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--paper); position: sticky; top: 0; z-index: 50; backdrop-filter: blur(8px); }
        .filter-row { display: flex; gap: 16px; align-items: center; margin-bottom: 16px; }
        .search-wrap { flex: 1; position: relative; }
        .search-input { width: 100%; padding: 12px 16px 12px 42px; background: var(--cream); border: 1px solid var(--line); border-radius: 100px; font-family: var(--sans); font-size: 14px; color: var(--ink); transition: all 0.2s ease; outline: none; }
        .search-input:focus { border-color: var(--ink); background: white; }
        .search-input::placeholder { color: var(--ink-mute); }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--ink-mute); pointer-events: none; }
        .filter-inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .filter-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .filter-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); margin-right: 4px; }
        .filter-pill { padding: 7px 16px; background: transparent; border: 1px solid var(--line-strong); border-radius: 100px; font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--ink-soft); cursor: pointer; transition: all 0.2s ease; white-space: nowrap; }
        .filter-pill:hover { border-color: var(--ink); color: var(--ink); }
        .filter-pill.active { background: var(--ink); border-color: var(--ink); color: var(--cream); }
        .results-count { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-mute); text-transform: uppercase; white-space: nowrap; }
        .results-count strong { font-weight: 500; color: var(--ink); }
        .strains-section { padding: 64px 0 120px; }
        .empty-state { text-align: center; padding: 80px 20px; font-family: var(--display); font-style: italic; font-size: 24px; color: var(--ink-mute); }
        .strain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px 24px; }
        .strain-card { background: var(--paper); border: 1px solid var(--line); cursor: pointer; transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); overflow: hidden; display: flex; flex-direction: column; }
        .strain-card:hover { transform: translateY(-4px); border-color: var(--line-strong); box-shadow: 0 20px 40px -20px rgba(26, 26, 24, 0.15); }
        .strain-card-visual { height: 200px; position: relative; overflow: hidden; }
        .strain-card-visual::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 40%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.15) 0%, transparent 60%); }
        .strain-card-number { position: absolute; top: 16px; left: 16px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; color: rgba(255,255,255,0.7); z-index: 2; }
        .strain-card-type-tag { position: absolute; bottom: 16px; left: 16px; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.95); padding: 4px 10px; border: 1px solid rgba(255,255,255,0.3); border-radius: 100px; z-index: 2; background: rgba(0,0,0,0.15); backdrop-filter: blur(4px); }
        .strain-card-body { padding: 24px 24px 28px; flex: 1; display: flex; flex-direction: column; }
        .strain-card-name { font-family: var(--display); font-size: 24px; line-height: 1.1; letter-spacing: -0.01em; margin-bottom: 4px; }
        .strain-card-genetics { font-family: var(--display); font-style: italic; font-size: 13px; color: var(--ink-mute); margin-bottom: 20px; font-weight: 300; }
        .strain-card-stats { display: flex; gap: 24px; padding-top: 16px; border-top: 1px dashed var(--line); }
        .stat { display: flex; flex-direction: column; gap: 2px; }
        .stat-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); }
        .stat-value { font-family: var(--mono); font-size: 14px; font-weight: 500; }
        .strain-card-terpene { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; }
        .terpene-name { font-size: 13px; color: var(--ink-soft); font-weight: 500; }
        .terpene-icon { width: 6px; height: 6px; border-radius: 50%; background: var(--copper); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(26, 26, 24, 0.75); backdrop-filter: blur(8px); z-index: 100; display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal { background: var(--paper); max-width: 900px; width: 100%; border-radius: 4px; overflow: hidden; position: relative; animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-close { position: absolute; top: 24px; right: 24px; width: 40px; height: 40px; background: rgba(255,255,255,0.9); border: 1px solid var(--line); border-radius: 50%; cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s; }
        .modal-close:hover { background: var(--ink); color: var(--cream); border-color: var(--ink); }
        .modal-hero { height: 480px; position: relative; overflow: hidden; }
        .modal-hero canvas { display: block; }
        .modal-hero-vignette { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 55%, transparent 25%, rgba(0,0,0,0.55) 100%); pointer-events: none; z-index: 1; }
        .modal-hero-content { position: absolute; bottom: 24px; left: 40px; z-index: 2; pointer-events: none; }
        .modal-hint { position: absolute; bottom: 24px; right: 40px; z-index: 2; font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.55); pointer-events: none; }
        .modal-number { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
        .modal-name { font-family: var(--display); font-style: italic; font-weight: 300; font-size: 56px; line-height: 1; color: white; letter-spacing: -0.02em; font-variation-settings: "SOFT" 60; text-shadow: 0 2px 16px rgba(0,0,0,0.5); }
        .modal-body { padding: 48px 40px; }
        .modal-section { margin-bottom: 40px; }
        .modal-section-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--line); }
        .modal-description { font-size: 16px; line-height: 1.7; color: var(--ink-soft); }
        .modal-description::first-letter { font-family: var(--display); font-style: italic; font-size: 48px; float: left; line-height: 0.9; margin: 6px 8px 0 0; color: var(--forest); }
        .modal-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .modal-stat { padding: 20px; background: var(--cream); border-radius: 4px; }
        .modal-stat-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-mute); margin-bottom: 8px; }
        .modal-stat-value { font-family: var(--display); font-style: italic; font-size: 32px; line-height: 1; }
        .modal-stat-detail { font-family: var(--mono); font-size: 11px; color: var(--ink-mute); margin-top: 6px; }
        .terpene-list { display: flex; flex-direction: column; gap: 14px; }
        .terpene-row { display: grid; grid-template-columns: 140px 1fr 50px; gap: 20px; align-items: center; }
        .terpene-row-name { font-size: 14px; font-weight: 500; }
        .terpene-row-name em { font-family: var(--display); font-style: italic; display: block; font-size: 11px; font-weight: 300; color: var(--ink-mute); margin-top: 2px; }
        .terpene-bar { height: 6px; background: var(--cream-dark); border-radius: 3px; overflow: hidden; }
        .terpene-bar-fill { height: 100%; background: linear-gradient(90deg, var(--forest), var(--copper)); border-radius: 3px; }
        .terpene-row-value { font-family: var(--mono); font-size: 12px; text-align: right; }
        .effects-tags { display: flex; flex-wrap: wrap; gap: 10px; }
        .effect-tag { padding: 8px 16px; background: var(--cream); border: 1px solid var(--line); border-radius: 100px; font-size: 13px; color: var(--ink-soft); font-weight: 500; }
        footer { background: var(--ink); color: var(--cream); padding: 80px 0 32px; position: relative; z-index: 2; }
        .disclaimer { background: rgba(139, 69, 19, 0.12); border: 1px solid rgba(139, 69, 19, 0.25); padding: 20px 24px; border-radius: 4px; margin-bottom: 48px; font-size: 13px; line-height: 1.6; color: rgba(244, 239, 229, 0.85); }
        .disclaimer strong { color: var(--copper); display: block; margin-bottom: 4px; letter-spacing: 0.05em; font-size: 11px; text-transform: uppercase; font-family: var(--mono); }
        .footer-bottom { padding-top: 32px; border-top: 1px solid rgba(244, 239, 229, 0.1); display: flex; justify-content: space-between; font-family: var(--mono); font-size: 11px; color: rgba(244, 239, 229, 0.5); flex-wrap: wrap; gap: 16px; letter-spacing: 0.05em; }
        @media (max-width: 900px) {
          .container { padding: 0 24px; }
          .strain-grid { grid-template-columns: repeat(2, 1fr); gap: 24px 20px; }
          nav ul { gap: 24px; }
          .header-meta { display: none; }
          .hero { padding: 64px 0 56px; }
          .hero-meta { gap: 32px; }
          .modal-hero { height: 380px; }
          .modal-name { font-size: 44px; }
          .modal-body { padding: 36px 32px; }
        }
        @media (max-width: 600px) {
          .container { padding: 0 16px; }
          header { padding: 16px 0; }
          .header-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
          .brand { gap: 8px; }
          .brand-mark { font-size: 20px; }
          .brand-tag { font-size: 9px; }
          nav { width: 100%; }
          nav ul { gap: 16px; flex-wrap: wrap; }
          nav a { font-size: 12px; }
          .hero { padding: 40px 0 32px; }
          .hero-eyebrow { font-size: 10px; margin-bottom: 20px; gap: 12px; }
          .hero-eyebrow::before { width: 20px; }
          .hero h1 { font-size: 32px; line-height: 1.1; }
          .hero-meta { gap: 20px; margin-top: 28px; padding-top: 20px; flex-direction: row; flex-wrap: wrap; }
          .hero-meta > div { flex: 1; min-width: 100px; }
          .hero-meta-value { font-size: 18px; }
          .hero-meta-label { font-size: 9px; }
          .filter-section { padding: 16px 0; }
          .filter-row { margin-bottom: 12px; }
          .search-input { font-size: 14px; padding: 10px 14px 10px 38px; }
          .filter-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
          .filter-group { gap: 8px; }
          .filter-pill { padding: 6px 12px; font-size: 12px; }
          .filter-label { display: none; }
          .strains-section { padding: 32px 0 64px; }
          .strain-grid { grid-template-columns: 1fr; gap: 20px; }
          .strain-card-visual { height: 180px; }
          .strain-card-body { padding: 20px 20px 24px; }
          .strain-card-name { font-size: 22px; }
          .modal-overlay { padding: 0; align-items: stretch; }
          .modal { max-width: 100%; border-radius: 0; min-height: 100vh; }
          .modal-close { top: 16px; right: 16px; width: 36px; height: 36px; font-size: 18px; }
          .modal-hero { height: 320px; }
          .modal-hero-content { left: 20px; bottom: 16px; }
          .modal-hint { right: 16px; bottom: 16px; font-size: 9px; letter-spacing: 0.12em; }
          .modal-number { font-size: 10px; margin-bottom: 8px; }
          .modal-name { font-size: 36px; }
          .modal-body { padding: 28px 20px 40px; }
          .modal-section { margin-bottom: 28px; }
          .modal-description { font-size: 15px; }
          .modal-description::first-letter { font-size: 36px; margin: 4px 6px 0 0; }
          .modal-stats-grid { grid-template-columns: 1fr; gap: 12px; }
          .modal-stat { padding: 16px; }
          .modal-stat-value { font-size: 26px; }
          .terpene-row { grid-template-columns: 1fr; gap: 6px; padding: 8px 0; border-bottom: 1px dashed var(--line); }
          .terpene-row:last-child { border-bottom: none; }
          .terpene-row-value { text-align: left; }
          .terpene-bar { width: 100%; }
          .effect-tag { font-size: 12px; padding: 6px 12px; }
          footer { padding: 48px 0 24px; }
          .disclaimer { padding: 16px; font-size: 12px; margin-bottom: 28px; }
          .footer-bottom { font-size: 10px; }
        }
      `}</style>

      <header>
        <div className="container">
          <div className="header-inner">
            <div className="brand">
              <div className="brand-mark">Canna<span>·</span>Boutique</div>
              <div className="brand-tag">CH · Est. 2026</div>
            </div>
            <nav>
              <ul>
                <li><a href="#sortiment">Sortiment</a></li>
                <li><a href="#wissen">Wissen</a></li>
                <li><a href="#ueber">Über uns</a></li>
                <li><a href="#kontakt">Kontakt</a></li>
              </ul>
            </nav>
            <div className="header-meta">Edition N° 01</div>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-eyebrow">Medizinisches Cannabis · Schweiz</div>
          <h1>Eine kuratierte Sammlung <em>botanischer Heilmittel</em> für die moderne Apotheke.</h1>
          <div className="hero-meta">
            <div><div className="hero-meta-label">Sortiment</div><div className="hero-meta-value">30 Sorten</div></div>
            <div><div className="hero-meta-label">Profile</div><div className="hero-meta-value">9 Terpene</div></div>
            <div><div className="hero-meta-label">Herkunft</div><div className="hero-meta-value">Kontrollierter Anbau</div></div>
          </div>
        </div>
      </section>

      <section className="filter-section" id="sortiment">
        <div className="container">
          <div className="filter-row">
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Suche nach Name, Terpen, Effekt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-inner">
            <div className="filter-group">
              <span className="filter-label">Typ</span>
              {[
                { v: "all", l: "Alle" },
                { v: "indica", l: "Indica" },
                { v: "sativa", l: "Sativa" },
                { v: "hybrid", l: "Hybrid" },
                { v: "cbd", l: "CBD" },
              ].map((f) => (
                <button
                  key={f.v}
                  className={`filter-pill ${filter === f.v ? "active" : ""}`}
                  onClick={() => setFilter(f.v)}
                >{f.l}</button>
              ))}
            </div>
            <div className="results-count"><strong>{filtered.length}</strong> Sorten</div>
          </div>
        </div>
      </section>

      <section className="strains-section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="empty-state">Keine Sorte gefunden — versuch einen anderen Suchbegriff.</div>
          ) : (
            <div className="strain-grid">
              {filtered.map((s) => (
                <div key={s.id} className="strain-card" onClick={() => setSelected(s)}>
                  <div className="strain-card-visual" style={{ background: s.color }}>
                    <div className="strain-card-number">N° {String(s.id).padStart(3, "0")}</div>
                    <div className="strain-card-type-tag">{s.typeLabel}</div>
                  </div>
                  <div className="strain-card-body">
                    <div className="strain-card-name">{s.name}</div>
                    <div className="strain-card-genetics">{s.genetics}</div>
                    <div className="strain-card-stats">
                      <div className="stat"><div className="stat-label">THC</div><div className="stat-value">{s.thc}%</div></div>
                      <div className="stat"><div className="stat-label">CBD</div><div className="stat-value">{s.cbd}%</div></div>
                    </div>
                    <div className="strain-card-terpene">
                      <span className="terpene-name">{s.dominant}</span>
                      <div className="terpene-icon"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal">
            <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            <div className="modal-hero" style={{ background: `linear-gradient(180deg, ${selected.color}dd 0%, ${selected.color} 50%, ${selected.color}cc 100%)` }}>
              <Bud3DErrorBoundary fallback={<StaticBudFallback strain={selected} />}>
                <ClientOnly fallback={<StaticBudFallback strain={selected} />}>
                  <BudViewer strain={selected} />
                </ClientOnly>
              </Bud3DErrorBoundary>
              <div className="modal-hero-vignette"></div>
              <div className="modal-hero-content">
                <div className="modal-number">N° {String(selected.id).padStart(3, "0")} · {selected.typeLabel}</div>
                <div className="modal-name">{selected.name}</div>
              </div>
              <div className="modal-hint">Klicken & ziehen</div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-label">Beschreibung · {selected.genetics}</div>
                <div className="modal-description">{selected.description}</div>
              </div>
              <div className="modal-section">
                <div className="modal-section-label">Cannabinoid-Profil</div>
                <div className="modal-stats-grid">
                  <div className="modal-stat"><div className="modal-stat-label">THC</div><div className="modal-stat-value">{selected.thc}%</div><div className="modal-stat-detail">Tetrahydrocannabinol</div></div>
                  <div className="modal-stat"><div className="modal-stat-label">CBD</div><div className="modal-stat-value">{selected.cbd}%</div><div className="modal-stat-detail">Cannabidiol</div></div>
                  <div className="modal-stat"><div className="modal-stat-label">Verhältnis</div><div className="modal-stat-value">{selected.thc > selected.cbd ? `${Math.round(selected.thc / selected.cbd)}:1` : `1:${Math.round(selected.cbd / selected.thc)}`}</div><div className="modal-stat-detail">THC zu CBD</div></div>
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-section-label">Terpen-Profil</div>
                <div className="terpene-list">
                  {selected.terpenes.map((t) => (
                    <div key={t.name} className="terpene-row">
                      <div className="terpene-row-name">{t.name}<em>{t.aroma}</em></div>
                      <div className="terpene-bar"><div className="terpene-bar-fill" style={{ width: `${t.value}%` }}></div></div>
                      <div className="terpene-row-value">{t.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-section">
                <div className="modal-section-label">Berichtete Effekte</div>
                <div className="effects-tags">
                  {selected.effects.map((e) => (<div key={e} className="effect-tag">{e}</div>))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="container">
          <div className="disclaimer">
            <strong>Wichtiger Hinweis</strong>
            Diese Webseite dient ausschliesslich zu Informationszwecken. Medizinisches Cannabis ist in der Schweiz seit August 2022 ohne BAG-Sonderbewilligung verschreibungsfähig, der Bezug erfolgt über Apotheken auf ärztliche Verschreibung. Diese Seite stellt keinen Verkauf dar.
          </div>
          <div className="footer-bottom">
            <div>© 2026 Canna Boutique CH</div>
            <div>Edition N° 01 · Prototyp</div>
          </div>
        </div>
      </footer>
    </>
  );
}
