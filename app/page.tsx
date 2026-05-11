"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
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

// =================================================================
// 3D BUD — high-resolution procedural cannabis bud with FBM noise,
// curved pistils, glass-like trichomes and per-strain variation
// =================================================================

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Smooth interpolation
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

// Value noise (smooth interpolated random)
function valueNoise3D(x: number, y: number, z: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  const u = smoothstep(fx);
  const v = smoothstep(fy);
  const w = smoothstep(fz);

  const corner = (cx: number, cy: number, cz: number) =>
    pseudoRandom(seed + cx * 73.7 + cy * 19.3 + cz * 137.1) * 2 - 1;

  const c000 = corner(ix, iy, iz);
  const c100 = corner(ix + 1, iy, iz);
  const c010 = corner(ix, iy + 1, iz);
  const c110 = corner(ix + 1, iy + 1, iz);
  const c001 = corner(ix, iy, iz + 1);
  const c101 = corner(ix + 1, iy, iz + 1);
  const c011 = corner(ix, iy + 1, iz + 1);
  const c111 = corner(ix + 1, iy + 1, iz + 1);

  const x00 = c000 * (1 - u) + c100 * u;
  const x10 = c010 * (1 - u) + c110 * u;
  const x01 = c001 * (1 - u) + c101 * u;
  const x11 = c011 * (1 - u) + c111 * u;

  const y0 = x00 * (1 - v) + x10 * v;
  const y1 = x01 * (1 - v) + x11 * v;

  return y0 * (1 - w) + y1 * w;
}

// Fractal Brownian Motion: layered noise for organic detail
function fbm(x: number, y: number, z: number, seed: number, octaves = 4) {
  let total = 0;
  let amp = 1;
  let freq = 1;
  let max = 0;
  for (let i = 0; i < octaves; i++) {
    total += valueNoise3D(x * freq, y * freq, z * freq, seed + i * 31) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return total / max;
}

type Phenotype = {
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
  bumpHighlight: THREE.Color;
  darkCrevice: THREE.Color;
  purpleHint: number;
  yellowHint: number;
  whiteHint: number;
  hasBranches: boolean;
  branchCount: number;
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
  const greenS = isSativa ? 0.52 : isCBD ? 0.4 : 0.46;
  const greenL = isSativa ? 0.32 : isIndica ? 0.21 : isCBD ? 0.36 : 0.27;
  const baseGreen = new THREE.Color().setHSL(greenH, greenS, greenL);
  const bumpHighlight = new THREE.Color().setHSL(greenH, greenS * 0.7, Math.min(0.58, greenL + 0.22));
  const darkCrevice = new THREE.Color().setHSL(greenH, greenS * 0.85, Math.max(0.06, greenL - 0.14));

  return {
    elongation: isSativa ? 1.55 + r(1) * 0.3 : isIndica ? 1.18 + r(1) * 0.15 : 1.35 + r(1) * 0.2,
    taper: isSativa ? 0.28 + r(2) * 0.08 : 0.18 + r(2) * 0.08,
    bumpStrength: 0.85 + r(4) * 0.4,
    asymmetry: 0.08 + r(5) * 0.12,
    pistilCount: Math.floor(75 + r(6) * 65),
    pistilLength: 0.25 + r(7) * 0.25,
    pistilThickness: 0.004 + r(8) * 0.003,
    pistilWhiteRatio: isOrange ? 0.05 + r(9) * 0.12 : 0.18 + r(9) * 0.3,
    pistilHue: 0.045 + r(10) * 0.05,
    pistilCurve: 0.3 + r(11) * 0.4,
    trichomeCount: isWhite ? Math.floor(600 + r(12) * 200) : Math.floor(420 + r(12) * 220),
    trichomeSize: 0.011 + r(13) * 0.007,
    trichomeGlow: isWhite ? 0.6 + r(14) * 0.3 : 0.4 + r(14) * 0.35,
    baseGreen,
    bumpHighlight,
    darkCrevice,
    purpleHint: isPurple ? 0.55 + r(15) * 0.25 : isIndica ? 0.1 + r(15) * 0.15 : 0,
    yellowHint: isLemon ? 0.18 + r(16) * 0.1 : 0.04 + r(16) * 0.04,
    whiteHint: isWhite ? 0.18 + r(17) * 0.1 : 0,
    hasBranches: r(18) > 0.5,
    branchCount: r(18) > 0.5 ? Math.floor(1 + r(19) * 2.5) : 0,
    sugarLeafCount: Math.floor(4 + r(20) * 6),
    seed,
  };
}

function budSurfacePoint(
  theta: number,
  phi: number,
  pheno: Phenotype,
  radialMultiplier = 1
): [number, number, number] {
  let x = Math.sin(phi) * Math.cos(theta);
  let y = Math.cos(phi);
  let z = Math.sin(phi) * Math.sin(theta);

  y *= pheno.elongation;
  const yNorm = y / pheno.elongation;
  const taperFactor = yNorm > 0 ? 1 - yNorm * pheno.taper : 1 + Math.abs(yNorm) * 0.06;
  x *= taperFactor;
  z *= taperFactor;

  const lean = Math.sin(yNorm * 1.5 + pheno.seed) * pheno.asymmetry;
  x += lean * Math.cos(pheno.seed);
  z += lean * Math.sin(pheno.seed);

  // Apply approximate FBM displacement so pistils/trichomes follow surface
  const noise =
    fbm(x * 1.3, y * 0.9, z * 1.3, pheno.seed, 3) * 0.13 +
    fbm(x * 3.5, y * 2.5, z * 3.5, pheno.seed + 100, 3) * 0.06;

  const dist = Math.sqrt(x * x + y * y + z * z);
  const newDist = (dist + noise * pheno.bumpStrength) * radialMultiplier;
  const scale = newDist / dist;

  return [x * scale, y * scale, z * scale];
}

// === MAIN BUD BODY GEOMETRY ===
// High-resolution icosahedron displaced with FBM noise → smooth, organic, knobbly
function buildBudGeometry(pheno: Phenotype): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 7); // ~10k verts
  const positions = geo.attributes.position;
  const colors: number[] = [];

  const purpleColor = new THREE.Color("#3a1f48");
  const yellowGreen = new THREE.Color("#9aa648");
  const whiteish = new THREE.Color("#c8d4b8");

  for (let i = 0; i < positions.count; i++) {
    let x = positions.getX(i);
    let y = positions.getY(i);
    let z = positions.getZ(i);

    // Cola shape: stretch + taper
    y *= pheno.elongation;
    const yNorm = y / pheno.elongation;
    const taperFactor = yNorm > 0 ? 1 - yNorm * pheno.taper : 1 + Math.abs(yNorm) * 0.06;
    x *= taperFactor;
    z *= taperFactor;

    // Asymmetric lean
    const lean = Math.sin(yNorm * 1.5 + pheno.seed) * pheno.asymmetry;
    x += lean * Math.cos(pheno.seed);
    z += lean * Math.sin(pheno.seed);

    // Multi-octave organic noise displacement.
    // Combination of low/medium/high frequency FBM with one strong calyx-cluster oscillation.
    const big = fbm(x * 1.3, y * 0.9, z * 1.3, pheno.seed, 3) * 0.14;
    const med = fbm(x * 3.5, y * 2.5, z * 3.5, pheno.seed + 100, 3) * 0.07;
    const fine = fbm(x * 9, y * 7, z * 9, pheno.seed + 200, 2) * 0.025;

    const totalBump = (big + med + fine) * pheno.bumpStrength;

    const dist = Math.sqrt(x * x + y * y + z * z);
    const newDist = dist + totalBump;
    const scale = newDist / dist;

    positions.setX(i, x * scale);
    positions.setY(i, y * scale);
    positions.setZ(i, z * scale);

    // === Per-vertex coloring ===
    const variation = pseudoRandom(i * 3.456 + pheno.seed);
    const c = pheno.baseGreen.clone();

    // Crevices darker (negative bump areas)
    if (totalBump < -0.02) {
      const darkAmount = Math.min(1, (-totalBump - 0.02) * 7);
      c.lerp(pheno.darkCrevice, darkAmount * 0.7);
    }

    // Bulges slightly highlighted
    if (totalBump > 0.03) {
      const liftAmount = Math.min(1, (totalBump - 0.03) * 6);
      c.lerp(pheno.bumpHighlight, liftAmount * 0.45);
    }

    // Purple tinting (indica / purple strains)
    if (pheno.purpleHint > 0) {
      const purpleAmt = pheno.purpleHint * (0.35 + variation * 0.65);
      // Purple shows more on the bulges (exposed parts of bud get more sun → more anthocyanin)
      const purpleBoost = totalBump > 0.02 ? 1.3 : 0.8;
      c.lerp(purpleColor, purpleAmt * 0.55 * purpleBoost);
    }

    // Yellow tint (lemon strains)
    if (pheno.yellowHint > 0) {
      c.lerp(yellowGreen, pheno.yellowHint * 0.45 * variation);
    }

    // Frost tint (white strains)
    if (pheno.whiteHint > 0) {
      c.lerp(whiteish, pheno.whiteHint * 0.3);
    }

    // Per-vertex random lightness for organic variation
    const lightness = 0.85 + pseudoRandom(i * 7.89 + pheno.seed) * 0.3;
    c.multiplyScalar(lightness);

    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
}

// === CURVED PISTIL ===
// Generates a TubeGeometry along a Bezier curve, with up-curl and random side bend
function buildCurvedPistilGeometry(
  surfacePos: [number, number, number],
  outDirection: THREE.Vector3,
  length: number,
  thickness: number,
  curveAmount: number,
  seed: number
): THREE.BufferGeometry {
  const start = new THREE.Vector3(...surfacePos);

  // Random perpendicular direction for side-curve
  const tempSide = new THREE.Vector3(
    pseudoRandom(seed * 7) - 0.5,
    pseudoRandom(seed * 11) - 0.5,
    pseudoRandom(seed * 13) - 0.5
  );
  const side = new THREE.Vector3().crossVectors(outDirection, tempSide).normalize();

  // Pistils tend to curl upward and outward
  const upBias = 0.25 + pseudoRandom(seed * 17) * 0.2;

  const p0 = start;
  const p1 = start.clone().add(outDirection.clone().multiplyScalar(length * 0.3));
  const p2 = start.clone()
    .add(outDirection.clone().multiplyScalar(length * 0.6))
    .add(side.clone().multiplyScalar(curveAmount * length * 0.25))
    .add(new THREE.Vector3(0, length * 0.08, 0));
  const p3 = start.clone()
    .add(outDirection.clone().multiplyScalar(length * 0.92))
    .add(side.clone().multiplyScalar(curveAmount * length * 0.5))
    .add(new THREE.Vector3(0, length * upBias, 0));

  const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);

  // Slight taper at tip — smaller tube radius near the end
  return new THREE.TubeGeometry(curve, 10, thickness, 5, false);
}

// === SUGAR LEAF SHAPE — cannabis-style serrated leaf ===
function makeSugarLeafShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.08, 0.04, -0.18, 0.06, -0.2, 0.16);
  s.lineTo(-0.12, 0.18);
  s.bezierCurveTo(-0.08, 0.24, -0.12, 0.32, -0.22, 0.34);
  s.lineTo(-0.14, 0.4);
  s.bezierCurveTo(-0.1, 0.5, -0.18, 0.58, -0.24, 0.62);
  s.lineTo(-0.14, 0.66);
  s.bezierCurveTo(-0.06, 0.74, -0.14, 0.84, -0.18, 0.88);
  s.lineTo(-0.06, 0.92);
  s.bezierCurveTo(-0.02, 0.96, 0, 1.0, 0, 1.0);
  // Mirror
  s.bezierCurveTo(0, 1.0, 0.02, 0.96, 0.06, 0.92);
  s.lineTo(0.18, 0.88);
  s.bezierCurveTo(0.14, 0.84, 0.06, 0.74, 0.14, 0.66);
  s.lineTo(0.24, 0.62);
  s.bezierCurveTo(0.18, 0.58, 0.1, 0.5, 0.14, 0.4);
  s.lineTo(0.22, 0.34);
  s.bezierCurveTo(0.12, 0.32, 0.08, 0.24, 0.12, 0.18);
  s.lineTo(0.2, 0.16);
  s.bezierCurveTo(0.18, 0.06, 0.08, 0.04, 0, 0);
  return s;
}

// Procedural noise texture for bump/roughness micro-detail
function generateBumpTexture(size = 256, seed = 0): THREE.CanvasTexture {
  if (typeof document === "undefined") {
    // SSR fallback
    const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
    blank.needsUpdate = true;
    return blank as unknown as THREE.CanvasTexture;
  }
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imgData = ctx.createImageData(size, size);
  for (let i = 0; i < imgData.data.length; i += 4) {
    // Multi-octave noise per pixel
    const px = (i / 4) % size;
    const py = Math.floor((i / 4) / size);
    const n1 = pseudoRandom(px * 1.7 + py * 3.1 + seed) * 0.5;
    const n2 = pseudoRandom(px * 0.3 + py * 0.5 + seed * 2) * 0.3;
    const n3 = pseudoRandom(px * 5.1 + py * 7.3 + seed * 3) * 0.2;
    const v = Math.floor((n1 + n2 + n3) * 255);
    imgData.data[i] = v;
    imgData.data[i + 1] = v;
    imgData.data[i + 2] = v;
    imgData.data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function rotationFromDir(dir: THREE.Vector3): [number, number, number] {
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  const e = new THREE.Euler().setFromQuaternion(q);
  return [e.x, e.y, e.z];
}

// =================================================================
// BUD COMPONENT
// =================================================================

function Bud({ strain }: { strain: Strain }) {
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    const pheno = getPhenotype(strain);
    const bodyGeometry = buildBudGeometry(pheno);

    // === PISTILS — curved tubes with bezier curves ===
    const pistils: Array<{
      geometry: THREE.BufferGeometry;
      color: THREE.Color;
    }> = [];
    for (let i = 0; i < pheno.pistilCount; i++) {
      const s = pheno.seed + i * 7.89;
      const theta = pseudoRandom(s) * Math.PI * 2;
      // Bias upper hemisphere
      const phi = Math.acos(2 * (pseudoRandom(s + 1) * 0.72 + 0.05) - 0.15);

      // Get surface position (with noise!) and slightly inside (so pistil emerges from inside)
      const surfacePos = budSurfacePoint(theta, phi, pheno, 0.97);

      // Outward direction (from origin through surface, biased up)
      const outDir = new THREE.Vector3(
        surfacePos[0],
        surfacePos[1] + 0.15,
        surfacePos[2]
      ).normalize();

      const length = pheno.pistilLength * (0.65 + pseudoRandom(s + 2) * 0.7);
      const thickness = pheno.pistilThickness * (0.7 + pseudoRandom(s + 3) * 0.6);
      const curve = pheno.pistilCurve * (0.5 + pseudoRandom(s + 4) * 1);

      const geometry = buildCurvedPistilGeometry(
        surfacePos,
        outDir,
        length,
        thickness,
        curve,
        s
      );

      // Color: white → yellow → orange → red gradient
      const t = pseudoRandom(s + 5);
      let color: THREE.Color;
      if (t < pheno.pistilWhiteRatio) {
        color = new THREE.Color().setHSL(0.14, 0.18, 0.88);
      } else {
        const hue = pheno.pistilHue + (pseudoRandom(s + 6) - 0.5) * 0.04;
        const sat = 0.7 + pseudoRandom(s + 7) * 0.22;
        const lig = 0.4 + pseudoRandom(s + 8) * 0.2;
        color = new THREE.Color().setHSL(hue, sat, lig);
      }

      pistils.push({ geometry, color });
    }

    // === TRICHOMES — small capsules with rotation following surface ===
    const trichomes: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      size: number;
    }> = [];
    for (let i = 0; i < pheno.trichomeCount; i++) {
      const s = pheno.seed + i * 2.7183;
      const theta = pseudoRandom(s) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(s + 1) - 1);
      const pos = budSurfacePoint(theta, phi, pheno, 1.015 + pseudoRandom(s + 2) * 0.02);
      const outDir = new THREE.Vector3(pos[0], pos[1], pos[2]).normalize();
      const size = pheno.trichomeSize * (0.55 + pseudoRandom(s + 3) * 0.9);
      // Trichome sits on surface and points outward
      const sx = pos[0] + outDir.x * size * 1.2;
      const sy = pos[1] + outDir.y * size * 1.2;
      const sz = pos[2] + outDir.z * size * 1.2;
      trichomes.push({
        position: [sx, sy, sz],
        rotation: rotationFromDir(outDir),
        size,
      });
    }

    // === SUGAR LEAVES ===
    const leaves: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      scale: number;
    }> = [];
    for (let i = 0; i < pheno.sugarLeafCount; i++) {
      const s = pheno.seed + i * 13.7;
      const theta = pseudoRandom(s) * Math.PI * 2;
      const phi = Math.acos(2 * (pseudoRandom(s + 1) * 0.65 + 0.12) - 0.2);
      const pos = budSurfacePoint(theta, phi, pheno, 1.0);
      const outDir = new THREE.Vector3(pos[0], pos[1] + 0.15, pos[2]).normalize();
      const scl = 0.2 + pseudoRandom(s + 2) * 0.12;
      const offset = 0.03;
      const baseRot = rotationFromDir(outDir);
      const spinZ = pseudoRandom(s + 3) * Math.PI * 2;
      leaves.push({
        position: [
          pos[0] + outDir.x * offset,
          pos[1] + outDir.y * offset,
          pos[2] + outDir.z * offset,
        ],
        rotation: [baseRot[0], baseRot[1], spinZ],
        scale: scl,
      });
    }

    // === SIDE BRANCHES with mini-buds ===
    const branches: Array<{
      origin: [number, number, number];
      rotation: [number, number, number];
      length: number;
      hasMiniBud: boolean;
      miniBudGeometry?: THREE.BufferGeometry;
    }> = [];
    if (pheno.hasBranches) {
      for (let i = 0; i < pheno.branchCount; i++) {
        const s = pheno.seed + i * 23.4;
        const theta = pseudoRandom(s) * Math.PI * 2;
        const yPos = -0.45 - pseudoRandom(s + 1) * 0.3;
        const yNorm = yPos / pheno.elongation;
        const taperFactor = yNorm > 0 ? 1 - yNorm * pheno.taper : 1 + Math.abs(yNorm) * 0.06;
        const r = 0.85 * taperFactor;
        const origin: [number, number, number] = [
          Math.cos(theta) * r,
          yPos,
          Math.sin(theta) * r,
        ];
        const outDir = new THREE.Vector3(
          Math.cos(theta) * 1.5,
          -0.2 + pseudoRandom(s + 2) * 0.5,
          Math.sin(theta) * 1.5
        ).normalize();
        const length = 0.3 + pseudoRandom(s + 3) * 0.3;
        const hasMiniBud = pseudoRandom(s + 4) > 0.25;

        // Mini-bud: simple deformed sphere
        let miniBudGeometry: THREE.BufferGeometry | undefined;
        if (hasMiniBud) {
          const mGeo = new THREE.IcosahedronGeometry(0.2, 3);
          const mp = mGeo.attributes.position;
          for (let j = 0; j < mp.count; j++) {
            const mx = mp.getX(j);
            const my = mp.getY(j);
            const mz = mp.getZ(j);
            const n = fbm(mx * 4, my * 4, mz * 4, s + j * 0.13, 2) * 0.04;
            const md = Math.sqrt(mx * mx + my * my + mz * mz);
            const sc = (md + n) / md;
            mp.setX(j, mx * sc);
            mp.setY(j, my * 1.3 * sc);
            mp.setZ(j, mz * sc);
          }
          mGeo.computeVertexNormals();
          miniBudGeometry = mGeo;
        }

        branches.push({
          origin,
          rotation: rotationFromDir(outDir),
          length,
          hasMiniBud,
          miniBudGeometry,
        });
      }
    }

    return { pheno, bodyGeometry, pistils, trichomes, leaves, branches };
  }, [strain]);

  // Procedural bump texture (regenerated per strain for slight variation)
  const bumpTexture = useMemo(() => generateBumpTexture(256, data.pheno.seed), [data.pheno.seed]);

  const sugarLeafShape = useMemo(() => makeSugarLeafShape(), []);

  // Cleanup geometries on unmount or strain change
  useEffect(() => {
    return () => {
      data.bodyGeometry.dispose();
      data.pistils.forEach((p) => p.geometry.dispose());
      data.branches.forEach((b) => b.miniBudGeometry?.dispose());
      bumpTexture.dispose();
    };
  }, [data, bumpTexture]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  const stemColor = "#5a4225";
  const stemColorLight = "#7b5e35";

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {/* === STEM === */}
      <mesh position={[0, -data.pheno.elongation - 0.28, 0]}>
        <cylinderGeometry args={[0.05, 0.065, 0.5, 12]} />
        <meshStandardMaterial color={stemColor} roughness={0.88} metalness={0.05} />
      </mesh>
      <mesh position={[0, -data.pheno.elongation, 0]}>
        <sphereGeometry args={[0.08, 14, 10]} />
        <meshStandardMaterial color={stemColorLight} roughness={0.8} />
      </mesh>

      {/* === SIDE BRANCHES === */}
      {data.branches.map((b, i) => (
        <group key={`br-${i}`} position={b.origin} rotation={b.rotation}>
          <mesh position={[0, b.length / 2, 0]}>
            <cylinderGeometry args={[0.014, 0.025, b.length, 8]} />
            <meshStandardMaterial color={stemColor} roughness={0.88} />
          </mesh>
          {b.hasMiniBud && b.miniBudGeometry && (
            <mesh position={[0, b.length + 0.15, 0]} geometry={b.miniBudGeometry}>
              <meshPhysicalMaterial
                color={data.pheno.baseGreen.clone().multiplyScalar(0.92)}
                roughness={0.6}
                metalness={0.02}
                clearcoat={0.2}
                clearcoatRoughness={0.5}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* === MAIN BUD BODY === */}
      <mesh geometry={data.bodyGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          vertexColors
          roughness={0.55}
          metalness={0.0}
          clearcoat={0.35}
          clearcoatRoughness={0.55}
          bumpMap={bumpTexture}
          bumpScale={0.025}
          sheen={0.3}
          sheenColor={new THREE.Color("#9bb070")}
          sheenRoughness={0.8}
        />
      </mesh>

      {/* === SUGAR LEAVES === */}
      {data.leaves.map((l, i) => (
        <mesh
          key={`leaf-${i}`}
          position={l.position}
          rotation={l.rotation}
          scale={[l.scale, l.scale, l.scale]}
        >
          <shapeGeometry args={[sugarLeafShape]} />
          <meshPhysicalMaterial
            color={data.pheno.baseGreen.clone().multiplyScalar(1.2)}
            roughness={0.65}
            metalness={0.02}
            side={THREE.DoubleSide}
            clearcoat={0.25}
            clearcoatRoughness={0.7}
          />
        </mesh>
      ))}

      {/* === CURVED PISTILS === */}
      {data.pistils.map((p, i) => (
        <mesh key={`p-${i}`} geometry={p.geometry}>
          <meshStandardMaterial
            color={p.color}
            roughness={0.7}
            metalness={0.0}
            emissive={p.color}
            emissiveIntensity={0.04}
          />
        </mesh>
      ))}

      {/* === TRICHOMES — glassy capsules === */}
      <Instances limit={900} range={data.trichomes.length}>
        <capsuleGeometry args={[1, 1.4, 4, 6]} />
        <meshPhysicalMaterial
          color="#fff8e0"
          emissive="#fff4c0"
          emissiveIntensity={data.pheno.trichomeGlow * 0.5}
          roughness={0.05}
          metalness={0.2}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          transmission={0.25}
          ior={1.45}
          thickness={0.5}
        />
        {data.trichomes.map((t, i) => (
          <Instance
            key={i}
            position={t.position}
            rotation={t.rotation}
            scale={[t.size, t.size * 1.5, t.size]}
          />
        ))}
      </Instances>
    </group>
  );
}

// =================================================================
// VIEWER
// =================================================================

function BudViewer({ strain }: { strain: Strain }) {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 4.0], fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <Environment preset="forest" background={false} environmentIntensity={0.8} />

        <directionalLight position={[5, 8, 5]} intensity={1.5} color="#fff6e3" castShadow />
        <directionalLight position={[-5, 3, -3]} intensity={0.8} color="#a8c4ff" />
        <directionalLight position={[0, -2, 4]} intensity={0.4} color="#ffd9a8" />
        <pointLight position={[3, 4, 2]} intensity={0.6} color="#ffffff" distance={12} />
        <pointLight position={[-2, 1, 3]} intensity={0.3} color="#e8f0ff" distance={8} />
        <ambientLight intensity={0.2} />

        <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.2}>
          <Bud strain={strain} />
        </Float>

        <ContactShadows
          position={[0, -1.85, 0]}
          opacity={0.6}
          blur={2.8}
          far={3}
          scale={5}
          color="#000000"
        />

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

// =================================================================
// MAIN PAGE
// =================================================================

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
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setSelected(null); };
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
          min-height: 100vh;
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
        .hero h1 { font-family: var(--display); font-weight: 300; font-size: clamp(48px, 7vw, 88px); line-height: 1.02; letter-spacing: -0.025em; max-width: 950px; font-variation-settings: "SOFT" 50, "opsz" 144; }
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
        .filter-pill { padding: 7px 16px; background: transparent; border: 1px solid var(--line-strong); border-radius: 100px; font-family: var(--sans); font-size: 13px; font-weight: 500; color: var(--ink-soft); cursor: pointer; transition: all 0.2s ease; }
        .filter-pill:hover { border-color: var(--ink); color: var(--ink); }
        .filter-pill.active { background: var(--ink); border-color: var(--ink); color: var(--cream); }
        .results-count { font-family: var(--mono); font-size: 11px; letter-spacing: 0.1em; color: var(--ink-mute); text-transform: uppercase; white-space: nowrap; }
        .results-count strong { font-weight: 500; color: var(--ink); }
        .strains-section { padding: 64px 0 120px; }
        .empty-state { text-align: center; padding: 80px 20px; font-family: var(--display); font-style: italic; font-size: 24px; color: var(--ink-mute); }
        .strain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px 24px; }
        @media (max-width: 900px) { .strain-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .strain-grid { grid-template-columns: 1fr; } .filter-inner { flex-direction: column; align-items: flex-start; } }
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
            <div>
              <div className="hero-meta-label">Sortiment</div>
              <div className="hero-meta-value">30 Sorten</div>
            </div>
            <div>
              <div className="hero-meta-label">Profile</div>
              <div className="hero-meta-value">9 Terpene</div>
            </div>
            <div>
              <div className="hero-meta-label">Herkunft</div>
              <div className="hero-meta-value">Kontrollierter Anbau</div>
            </div>
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
                { v: "cbd", l: "CBD-dominant" },
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
                      <div className="stat">
                        <div className="stat-label">THC</div>
                        <div className="stat-value">{s.thc}%</div>
                      </div>
                      <div className="stat">
                        <div className="stat-label">CBD</div>
                        <div className="stat-value">{s.cbd}%</div>
                      </div>
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
              <BudViewer strain={selected} />
              <div className="modal-hero-vignette"></div>
              <div className="modal-hero-content">
                <div className="modal-number">N° {String(selected.id).padStart(3, "0")} · {selected.typeLabel}</div>
                <div className="modal-name">{selected.name}</div>
              </div>
              <div className="modal-hint">Klicken & ziehen zum Drehen</div>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <div className="modal-section-label">Beschreibung · {selected.genetics}</div>
                <div className="modal-description">{selected.description}</div>
              </div>
              <div className="modal-section">
                <div className="modal-section-label">Cannabinoid-Profil</div>
                <div className="modal-stats-grid">
                  <div className="modal-stat">
                    <div className="modal-stat-label">THC</div>
                    <div className="modal-stat-value">{selected.thc}%</div>
                    <div className="modal-stat-detail">Tetrahydrocannabinol</div>
                  </div>
                  <div className="modal-stat">
                    <div className="modal-stat-label">CBD</div>
                    <div className="modal-stat-value">{selected.cbd}%</div>
                    <div className="modal-stat-detail">Cannabidiol</div>
                  </div>
                  <div className="modal-stat">
                    <div className="modal-stat-label">Verhältnis</div>
                    <div className="modal-stat-value">{selected.thc > selected.cbd ? `${Math.round(selected.thc / selected.cbd)}:1` : `1:${Math.round(selected.cbd / selected.thc)}`}</div>
                    <div className="modal-stat-detail">THC zu CBD</div>
                  </div>
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
