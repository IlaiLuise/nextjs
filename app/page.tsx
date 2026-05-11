"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Bud({ tint }: { tint: string }) {
  const meshRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 5);
    const positions = geo.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);

      const noise1 = Math.sin(x * 3.2) * Math.cos(y * 3.2) * Math.sin(z * 3.2) * 0.18;
      const noise2 = Math.sin(x * 7) * Math.cos(y * 7) * 0.06;
      const bumpiness = pseudoRandom(i * 12.9898) * 0.1;

      const length = Math.sqrt(x * x + y * y + z * z);
      const scale = (length + noise1 + noise2 + bumpiness) / length;

      positions.setX(i, x * scale);
      positions.setY(i, y * scale);
      positions.setZ(i, z * scale);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={tint} roughness={0.65} metalness={0.05} />
      </mesh>
      <Trichomes />
    </group>
  );
}

function Trichomes() {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i < 120; i++) {
      const seed = i * 2.7183;
      const theta = pseudoRandom(seed) * Math.PI * 2;
      const phi = Math.acos(2 * pseudoRandom(seed + 1) - 1);
      const r = 1.1 + pseudoRandom(seed + 2) * 0.1;
      pts.push([
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ]);
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial color="#f5e8b8" emissive="#f5e8b8" emissiveIntensity={0.35} roughness={0.3} />
        </mesh>
      ))}
    </>
  );
}

function BudViewer({ strain }: { strain: Strain }) {
  const tint = strain.type === "indica" ? "#4a3855"
    : strain.type === "sativa" ? "#4a6b3a"
    : strain.type === "cbd" ? "#3a5a55"
    : "#5a4a3a";

  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]}>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#aab8ff" />
      <Bud tint={tint} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.8}
      />
    </Canvas>
  );
}

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
        .modal-hero { height: 380px; position: relative; overflow: hidden; }
        .modal-hero canvas { display: block; }
        .modal-hero-content { position: absolute; bottom: 24px; left: 40px; z-index: 2; pointer-events: none; }
        .modal-hint { position: absolute; bottom: 24px; right: 40px; z-index: 2; font-family: var(--mono); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(255,255,255,0.55); pointer-events: none; }
        .modal-number { font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em; color: rgba(255,255,255,0.7); margin-bottom: 12px; }
        .modal-name { font-family: var(--display); font-style: italic; font-weight: 300; font-size: 56px; line-height: 1; color: white; letter-spacing: -0.02em; font-variation-settings: "SOFT" 60; text-shadow: 0 2px 16px rgba(0,0,0,0.3); }
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
            <div className="modal-hero" style={{ background: selected.color }}>
              <BudViewer strain={selected} />
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
