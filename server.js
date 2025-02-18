require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Fuse = require('fuse.js');

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Middleware
app.use(express.json());
app.use(cors());

// Example GET endpoint
app.get('/', (req, res) => {
  res.send('Jemena Bot is running!');
});

// Example POST endpoint
app.post('/api/data', (req, res) => {
  const data = req.body;
  res.json({ message: 'Data received!', data });
});

// Validate API Key
if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY is missing from .env file');
  process.exit(1);
}

// Chemistry Knowledge Base 
const productData = {
    "Sodium Hydroxide": { 
        category: "Soaps and Detergents", 
        partialUses: "Essential for soap making.", 
        packaging: ["Custom Packaging Available", "25kg"],
        available: true
    },
    "SLES 70%": { 
        category: "Soaps and Detergents", 
        partialUses: "Foaming agent in detergents.", 
        packaging: ["5kg", "20kg"],
        available: true
    },
    "Sulphonic Acid LABSA 90%": { 
        category: "Soaps and Detergents", 
        partialUses: "Key ingredient in detergents.", 
        packaging: ["5kg", "20kg"],
        available: true 
    },
    "Sodium Tripolyphosphate (STPP)": { 
        category: "Soaps and Detergents", 
        partialUses: "Water softener in detergents.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Benzalkonium Chloride 50%": { 
        category: "Soaps and Detergents", 
        partialUses: "Versatile disinfectant for healthcare and industrial uses.", 
        packaging: ["5kg", "20kg"],
        available: true
    },
    "Benzalkonium Chloride 80%": { 
        category: "Soaps and Detergents", 
        partialUses: "High-concentration disinfectant for industrial applications.", 
        packaging: ["5kg", "20kg"],
        available: true 
    },
    "CMC (Sodium Carboxymethyl Cellulose)": { 
        category: "Soaps and Detergents", 
        partialUses: "Thickening agent used in food and pharmaceutical industries.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Cocodiethanol Amide 85% (CDE)": { 
        category: "Soaps and Detergents", 
        partialUses: "Enhances foaming in shampoos and personal care products.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Deionized Water": { 
        category: "Soaps and Detergents", 
        partialUses: "Used in laboratories, cosmetics, and industrial processes.", 
        packaging: ["20kg"], 
        available: true
    },
    "EDTA 99% Disodium (2NA)": { 
        category: "Soaps and Detergents", 
        partialUses: "Chelating agent for cleaning and stabilizing solutions.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "EDTA 99% Tetra Sodium (4NA)": { 
        category: "Soaps and Detergents", 
        partialUses: "Water softener for detergents and industrial processes.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Fabric Softener Stepantex VL 90A": { 
        category: "Soaps and Detergents", 
        partialUses: "Enhances softness and fragrance in laundry.", 
        packaging: ["5kg", "10kg", "20kg"], 
        available: true
    },
    "Fine Salt": { 
        category: "Soaps and Detergents", 
        partialUses: "Refined salt for industrial and food-grade applications.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Formalin (Formaldehyde 37%)": { 
        category: "Soaps and Detergents", 
        partialUses: "Preservative and disinfectant for industrial use.", 
        packaging: ["Custom Packaging Available", "35kg"], 
        available: true
    },
    "Hydrofluoric Acid 50-55%": { 
        category: "Soaps and Detergents", 
        partialUses: "Specialized acid for etching and cleaning applications.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Industrial Salt": { 
        category: "Soaps and Detergents", 
        partialUses: "Salt for chemical processes and de-icing.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Kaolin": { 
        category: "Soaps and Detergents", 
        partialUses: "Fine clay for ceramics, paints, and filler applications.", 
        packaging: ["50kg"], 
        available: true
    },
    "Magnesium Sulphate Crystal (Epsom Salt)": { 
        category: "Soaps and Detergents", 
        partialUses: "Therapeutic and agricultural applications.", 
        packaging: ["25kg", "50kg"], 
        available: true
    },
    "Nansa H85": { 
        category: "Soaps and Detergents", 
        partialUses: "Surfactant for detergents and cleaning agents.", 
        packaging: ["Custom Packaging Available", "20kg"], 
        available: true
    },
    "Nonylphenol Ethoxylate (NPE9)": { 
        category: "Soaps and Detergents", 
        partialUses: "Non-ionic surfactant for emulsifying and cleaning.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Oleic Acid 75%": { 
        category: "Soaps and Detergents", 
        partialUses: "Used in soaps, cosmetics, and lubricants.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Optical Brightener": { 
        category: "Soaps and Detergents", 
        partialUses: "Enhances brightness in textiles and papers.", 
        packaging: ["1kg", "5kg", "10kg", "24kg"], 
        available: true
    },
    "Para-dichlorobenzene (PDCB)": { 
        category: "Soaps and Detergents", 
        partialUses: "Deodorizer and solvent for industrial applications.", 
        packaging: ["25kg"], 
        available: true
    },
    "Pearlizer/Ufablend": { 
        category: "Soaps and Detergents", 
        partialUses: "Provides pearlescent finish to cosmetics and detergents.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Pine Oil 85% & 96%": { 
        category: "Soaps and Detergents", 
        partialUses: "Disinfectant and fragrance in cleaning products.", 
        packaging: ["1kg", "5kg", "20kg"], 
        available: true
    },
    "Polyquaternium7 (PQ7)": { 
        category: "Soaps and Detergents", 
        partialUses: "Used in conditioners and personal care products.", 
        packaging: ["1kg", "5kg", "20kg"], 
        available: true
    },
    "Potassium Hydroxide Flakes": { 
        category: "Soaps and Detergents", 
        partialUses: "Key ingredient for soap and industrial applications.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Whiting 40 (Calcium Carbonate 52%)": { 
        category: "Soaps and Detergents", 
        partialUses: "Used as filler and coating in paints and plastics.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Soda Ash Light": { 
        category: "Soaps and Detergents", 
        partialUses: "Commonly used in glass manufacturing and detergents.", 
        packaging: ["Custom Packaging Available", "50kg Bags"], 
        available: true
    },
    "Sodium Bicarbonate": { 
        category: "Soaps and Detergents", 
        partialUses: "Versatile product used in baking, cleaning, and pharmaceuticals.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Carbonate Dense (Magadi)": { 
        category: "Soaps and Detergents", 
        partialUses: "Widely used in detergents and glass production.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Sodium Cumene Sulfonate 40% (SC40)": { 
        category: "Soaps and Detergents", 
        partialUses: "Cleaning agent and solubilizer for household products.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Gluconate": { 
        category: "Soaps and Detergents", 
        partialUses: "Used as a chelating agent and concrete additive.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Hydrosulphite 88%": { 
        category: "Soaps and Detergents", 
        partialUses: "A bleaching agent used in textiles and pulp industries.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Sodium Hypochlorite 10%": { 
        category: "Soaps and Detergents", 
        partialUses: "Powerful disinfectant for water treatment and cleaning.", 
        packaging: ["Custom Packaging Available", "24kg"], 
        available: true
    },
    "Sodium Meta Bisulphite": { 
        category: "Soaps and Detergents", 
        partialUses: "Preservative and disinfectant for industrial use.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Metasilicate Penta": { 
        category: "Soaps and Detergents", 
        partialUses: "Detergent builder and corrosion inhibitor.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Perborate Tetrahydrate": { 
        category: "Soaps and Detergents", 
        partialUses: "Used in detergents for its bleaching properties.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sodium Silicate": { 
        category: "Soaps and Detergents", 
        partialUses: "Binder in cements and refractory applications.", 
        packaging: ["Custom Packaging Available", "30kg"], 
        available: true
    },
    "Sodium Sulphate Anhydrous": { 
        category: "Soaps and Detergents", 
        partialUses: "Used in detergents and paper manufacturing.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Sodium Xylene Sulfonate 60%": { 
        category: "Soaps and Detergents", 
        partialUses: "Detergent additive and solubilizer.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Sulphonic Acid LABSA 90% & 96%": { 
        category: "Soaps and Detergents", 
        partialUses: "Main ingredient in detergents and cleaning products.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Talcum Powder": { 
        category: "Soaps and Detergents", 
        partialUses: "Used as a filler in various industrial applications.", 
        packaging: ["50kg"], 
        available: true
    },
    "Tego Betain CAPB 30%": { 
        category: "Soaps and Detergents", 
        partialUses: "Mild surfactant for personal care and detergents.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Titanium Dioxide": { 
        category: "Soaps and Detergents", 
        partialUses: "White pigment used in paints, plastics, and cosmetics.", 
        packaging: ["25kg"], 
        available: true
    },
    "Triethanolamine 99% (TEA)": { 
        category: "Soaps and Detergents", 
        partialUses: "Emulsifier and pH balancer for personal care products.", 
        packaging: ["1kg", "5kg", "20kg"], 
        available: true
    },
    "Urea": { 
        category: "Soaps and Detergents", 
        partialUses: "Fertilizer and raw material for industrial applications.", 
        packaging: ["50kg"], 
        available: true
    },
    "Acetone": { 
        category: "Solvents", 
        partialUses: "A versatile solvent used in cleaning, thinning, and cosmetic formulations.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Butyl Glycol Ether": { 
        category: "Solvents", 
        partialUses: "Solvent for paints, coatings, and cleaning products.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Carbomer 940": { 
        category: "Solvents", 
        partialUses: "Thickening agent in personal care and cosmetic products.", 
        packaging: ["Custom Packaging Available", "20kg"], 
        available: true
    },
    "Denatured IMS 96%": { 
        category: "Solvents", 
        partialUses: "Industrial solvent and disinfectant for various applications.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Isopropyl Alcohol Pure": { 
        category: "Solvents", 
        partialUses: "A multipurpose solvent and sanitizer in cleaning and cosmetic products.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Methanol Denatured": { 
        category: "Solvents", 
        partialUses: "Solvent for industrial and laboratory use.", 
        packaging: ["5kg", "20kg"],
        available: true
    },
    "Solvent C9 (Naphtha 100)": { 
        category: "Solvents", 
        partialUses: "Used in paints, coatings, and industrial cleaning applications.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "White Spirit": { 
        category: "Solvents", 
        partialUses: "Solvent for thinning paints, cleaning tools, and degreasing surfaces.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Aluminium Sulphate Powder": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Used in water treatment and paper manufacturing.", 
        packaging: ["50kg"], 
        available: true
    },
    "Ammonia Liquor 25%": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Commonly used in industrial cleaning and water treatment.", 
        packaging: ["5kg", "20kg", "33kg"], 
        available: true
    },
    "Calcium Hypo Chlorite 65-70%": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Disinfectant for water treatment and swimming pools.", 
        packaging: ["Custom Packaging Available", "45kg"], 
        available: true
    },
    "Chlorine 90% TCCA": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Highly effective in water disinfection and sanitation.", 
        packaging: ["Custom Packaging Available", "50kg"], 
        available: true
    },
    "Copper Sulphate Pentahydrate": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Used in agriculture, water treatment, and chemical manufacturing.", 
        packaging: ["25kg"], 
        available: true
    },
    "Poly Aluminium Chloride (PAC)": { 
        category: "Water Treatment Chemicals", 
        partialUses: "Efficient coagulant for water purification and treatment.", 
        packaging: ["25kg", "50kg"], 
        available: true
    },
    "Borax Decahydrate": { 
        category: "Mining", 
        partialUses: "Used in cleaning, as a flux in metallurgy, and in the manufacture of glass and ceramics.", 
        packaging: ["25kg"], 
        available: true
    },
    "Caustic Soda Flakes": { 
        category: "Mining", 
        partialUses: "Used in soap making, water treatment, and in the manufacturing of various chemicals.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Caustic Soda Pearls": { 
        category: "Mining", 
        partialUses: "Commonly used in cleaning, manufacturing of soaps, and as a neutralizing agent in industrial processes.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Hydrochloric Acid 30-35%": { 
        category: "Mining", 
        partialUses: "Used in pickling of metals, in the production of organic compounds, and as a laboratory reagent.", 
        packaging: ["Custom Packaging Available", "40kg"], 
        available: true
    },
    "Hydrogen Peroxide 50%": { 
        category: "Mining", 
        partialUses: "Used as a bleaching agent, disinfectant, and for water treatment.", 
        packaging: ["Custom Packaging Available", "30kg", "40kg"], 
        available: true
    },
    "Nitric Acid": { 
        category: "Mining", 
        partialUses: "Used in the production of fertilizers, explosives, and as a cleaning agent in industrial applications.", 
        packaging: ["35kg"], 
        available: true
    },
    "Oxalic Acid Dihydrate": { 
        category: "Mining", 
        partialUses: "Used as a cleaning agent, in bleaching, and in rust removal.", 
        packaging: ["Custom Packaging Available", "25kg"],
        available: true
    },
    "Sulphuric Acid": { 
        category: "Mining", 
        partialUses: "Widely used in industry for producing fertilizers, chemicals, and in petroleum refining.", 
        packaging: ["47kg"], 
        available: true
    },
    "Sodium Sulphide (Yellow Flakes)": { 
        category: "Mining", 
        partialUses: "Used in the manufacture of dyes, textiles, and in chemical processes in industries like paper production.", 
        packaging: ["25kg"], 
        available: true
    },
    "Citric Acid": { 
        category: "Food Industry", 
        partialUses: "Used as a preservative, flavoring agent, and in the production of cleaning agents and cosmetics.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Corn Starch": { 
        category: "Food Industry", 
        partialUses: "Used in the food industry as a thickening agent and in the production of biodegradable plastics.", 
        packaging: ["25kg"], 
        available: true
    },
    "Glacial Acetic Acid": { 
        category: "Food Industry", 
        partialUses: "Used in the production of vinegar, as a solvent, and in chemical synthesis processes.", 
        packaging: ["Custom Packaging Available", "30kg"],
        available: true
    },
    "Hydrogen Peroxide 35%": { 
        category: "Food Industry", 
        partialUses: "Used as a disinfectant, bleach, and in the treatment of drinking water and wastewater.", 
        packaging: ["Custom Packaging Available", "30kg"], 
        available: true
    },
    "Phosphoric Acid Food Grade 85%": { 
        category: "Food Industry", 
        partialUses: "Used in the food industry as an acidulant, pH adjuster, and in the production of phosphate salts.", 
        packaging: ["Custom Packaging Available", "35kg"], 
        available: true
    },
    "Sodium Benzoate Powder": { 
        category: "Food Industry", 
        partialUses: "Used as a preservative in food and beverages, and in cosmetics and pharmaceuticals.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Color Acid Blue 80": { 
        category: "Essential Oils", 
        partialUses: "Used for coloring in industrial and textile applications.", 
        packaging: ["1kg"],
        available: true 
    },
    "Color Apple Green": { 
        category: "Essential Oils", 
        partialUses: "Widely used in food, textiles, and personal care products for vibrant green shades.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Brilliant Blue": { 
        category: "Essential Oils", 
        partialUses: "Commonly used in food, beverages, and cosmetics for a bright blue hue.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Egg Yellow": { 
        category: "Essential Oils", 
        partialUses: "Used in food coloring, cosmetics, and decorative applications.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Iragon Blue ABL 9": { 
        category: "Essential Oils", 
        partialUses: "Specialized blue dye for industrial and personal care use.", 
        packaging: ["1kg"],
        available: true 
    },
    "Color Pink Rose": { 
        category: "Essential Oils", 
        partialUses: "Used in cosmetics, food products, and decorative applications.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Puricolor Green PGR7": { 
        category: "Essential Oils", 
        partialUses: "Bright green dye for industrial and decorative purposes.", 
        packaging: ["1kg"],
        available: true 
    },
    "Color Puricolor Yellow AYE 23": { 
        category: "Essential Oils", 
        partialUses: "Yellow dye for food, textile, and cosmetic applications.", 
        packaging: ["1kg"],
        available: true 
    },
    "Color Raspberry": { 
        category: "Essential Oils", 
        partialUses: "Used for a vibrant red color in food, cosmetics, and textiles.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Sunset Yellow": { 
        category: "Essential Oils", 
        partialUses: "Widely used in food and beverages for bright orange-yellow hues.", 
        packaging: ["1kg"], 
        available: true
    },
    "Color Tomato Red": { 
        category: "Essential Oils", 
        partialUses: "Used in food, cosmetics, and textiles for vibrant red tones.", 
        packaging: ["1kg"], 
        available: true
    },
    "Essential Oil Almond Sweet": { 
        category: "Essential Oils", 
        partialUses: "Used in cosmetics, massage oils, and aromatherapy for its nourishing properties.", 
        packaging: ["1L"], 
        available: true
    },
    "Essential Oil Aloe Vera": { 
        category: "Essential Oils", 
        partialUses: "Known for its soothing and hydrating properties in skincare products.", 
        packaging: ["1L"], 
        available: true
    },
    "Essential Oil Eucalyptus": { 
        category: "Essential Oils", 
        partialUses: "Used for its refreshing aroma and therapeutic properties in personal care products.", 
        packaging: ["1L"], 
        available: true
    },
    "Essential Oil Frutine": { 
        category: "Essential Oils", 
        partialUses: "A fruity oil blend for use in cosmetics, perfumes, and air fresheners.", 
        packaging: ["1L"], 
        available: true
    },
    "Essential Oil Kired": { 
        category: "Essential Oils", 
        partialUses: "A specialty oil for cosmetics and personal care formulations.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Lemon Grass": { 
        category: "Essential Oils", 
        partialUses: "Used in aromatherapy, skincare, and as a natural insect repellent.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Lemon Perfume": { 
        category: "Essential Oils", 
        partialUses: "A refreshing lemon fragrance for perfumes and personal care products.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Peppermint BP": { 
        category: "Essential Oils", 
        partialUses: "Known for its cooling and invigorating properties in skincare and aromatherapy.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Pine Fresh": { 
        category: "Essential Oils", 
        partialUses: "Used for its refreshing pine scent in air fresheners and personal care products.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Silky": { 
        category: "Essential Oils", 
        partialUses: "A light, silky fragrance oil for cosmetic and aromatherapy applications.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Suaril": { 
        category: "Essential Oils", 
        partialUses: "A versatile oil for use in cosmetics and perfumes.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Essential Oil Tea Tree Oil": { 
        category: "Essential Oils", 
        partialUses: "Known for its antibacterial and antifungal properties in skincare products.", 
        packaging: ["500ml", "1L"], 
        available: true
    },
    "Fragrance Apricot": { 
        category: "Essential Oils", 
        partialUses: "A sweet and fruity apricot fragrance for personal care products and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Fragrance Eternall Eagle": { 
        category: "Essential Oils", 
        partialUses: "A bold and sophisticated fragrance for high-end personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Fragrance Grape Fruit": { 
        category: "Essential Oils", 
        partialUses: "A refreshing and tangy grapefruit scent for perfumes and cosmetics.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Fragrance Strawberry": { 
        category: "Essential Oils", 
        partialUses: "A sweet and vibrant strawberry scent for various personal care applications.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Fragrance Pineapple": { 
        category: "Essential Oils", 
        partialUses: "A tropical pineapple fragrance for cosmetics and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Apple": { 
        category: "Essential Oils", 
        partialUses: "A crisp and fresh apple scent for perfumes and personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Apple Fizz": { 
        category: "Essential Oils", 
        partialUses: "A vibrant and fizzy apple fragrance ideal for perfumes and personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Apricot": { 
        category: "Essential Oils", 
        partialUses: "A sweet and fruity apricot scent for cosmetics and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Blue Fresh": { 
        category: "Essential Oils", 
        partialUses: "A clean and aquatic fragrance suitable for freshening products and perfumes.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Bubble Gum": { 
        category: "Essential Oils", 
        partialUses: "A playful and sweet scent reminiscent of bubble gum.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Caramel": { 
        category: "Essential Oils", 
        partialUses: "A warm and sweet caramel fragrance for personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Caring Moments": { 
        category: "Essential Oils", 
        partialUses: "A comforting and soft fragrance for use in cosmetics and perfumes.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Carnation": { 
        category: "Essential Oils", 
        partialUses: "A floral carnation scent ideal for air fresheners and personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Citrus": { 
        category: "Essential Oils", 
        partialUses: "A bright and zesty citrus scent for perfumes and cleaning products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Coco Butter": { 
        category: "Essential Oils", 
        partialUses: "A rich and creamy cocoa butter fragrance for skincare products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Earternal Eagle": { 
        category: "Essential Oils", 
        partialUses: "A bold and majestic fragrance for high-end personal care items.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Florazol": { 
        category: "Essential Oils", 
        partialUses: "A refreshing floral fragrance suitable for perfumes and cleaning products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Fresh Toilet Cleaner": { 
        category: "Essential Oils", 
        partialUses: "A crisp and fresh fragrance designed for cleaning products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Intense Clean": { 
        category: "Essential Oils", 
        partialUses: "A sharp and invigorating fragrance for cleaning solutions and fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Jojoba": { 
        category: "Essential Oils", 
        partialUses: "A mild and nourishing jojoba fragrance for skincare and cosmetic products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Lavender": { 
        category: "Essential Oils", 
        partialUses: "A calming lavender scent ideal for personal care and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Lemon 3": { 
        category: "Essential Oils", 
        partialUses: "A bright and tangy lemon fragrance for cleaning products and cosmetics.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Mangue Vanille": { 
        category: "Essential Oils", 
        partialUses: "A sweet mango and vanilla blend ideal for personal care and perfumes.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Marine Fresh": { 
        category: "Essential Oils", 
        partialUses: "A refreshing marine-inspired scent perfect for cleaning products and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume New Car": { 
        category: "Essential Oils", 
        partialUses: "A crisp, leathery scent mimicking the smell of a new car interior.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Orange": { 
        category: "Essential Oils", 
        partialUses: "A juicy and zesty orange fragrance for personal care and cleaning products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Passion": { 
        category: "Essential Oils", 
        partialUses: "A sultry and exotic passionfruit scent for perfumes and skincare.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Peach": { 
        category: "Essential Oils", 
        partialUses: "A soft and sweet peach fragrance for air fresheners and personal care items.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Pine": { 
        category: "Essential Oils", 
        partialUses: "A classic pine scent suitable for cleaning and freshening products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Pineaple NK": { 
        category: "Essential Oils", 
        partialUses: "A tropical pineapple fragrance for cosmetics and household products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume PineappleStrawberry": { 
        category: "Essential Oils", 
        partialUses: "A fruity blend of pineapple and strawberry for vibrant and playful scents.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Pink Breeze": { 
        category: "Essential Oils", 
        partialUses: "A fresh and light pink floral fragrance for cosmetics and perfumes.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Purete": { 
        category: "Essential Oils", 
        partialUses: "A pure and clean fragrance for a refreshing sensory experience.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Rose": { 
        category: "Essential Oils", 
        partialUses: "A classic rose fragrance ideal for perfumes and air fresheners.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Sheer Summer": { 
        category: "Essential Oils", 
        partialUses: "A breezy summer-inspired scent for vibrant perfumes and cosmetics.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Soft Peach": { 
        category: "Essential Oils", 
        partialUses: "A delicate peach fragrance suitable for skincare and personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Strawberry Ice Cream": { 
        category: "Essential Oils", 
        partialUses: "A creamy and sweet strawberry scent for personal and household products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Stwaberry EP": { 
        category: "Essential Oils", 
        partialUses: "A bright strawberry fragrance ideal for freshening and care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Sundance": { 
        category: "Essential Oils", 
        partialUses: "A sunny and uplifting fragrance for vibrant skincare and perfumes.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Sweet Lemon": { 
        category: "Essential Oils", 
        partialUses: "A sweet and citrusy lemon scent for air fresheners and cosmetics.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Tropical Burst": { 
        category: "Essential Oils", 
        partialUses: "A vibrant tropical mix of fruity notes for energetic personal care products.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Vanilla": { 
        category: "Essential Oils", 
        partialUses: "A warm and inviting vanilla fragrance for perfumes and personal care items.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Perfume Vanilla Blossom": { 
        category: "Essential Oils", 
        partialUses: "A floral and vanilla combination for elegant and sophisticated fragrances.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Diethlphthalate 99%": { 
        category: "Essential Oils", 
        partialUses: "A versatile plasticizer and solvent used in various industrial applications.", 
        packaging: ["500ml", "1L", "5L"], 
        available: true
    },
    "Castor Oil": { 
        category: "Cosmetics", 
        partialUses: "Used in cosmetics, pharmaceuticals, and as a lubricant in industrial applications.", 
        packaging: ["1kg", "5kg", "20kg"], 
        available: true
    },
    "Ceto Stearyl Alcohol": { 
        category: "Cosmetics", 
        partialUses: "Used as an emulsifying agent and thickener in creams, lotions, and cosmetic formulations.", 
        packaging: ["Custom Packaging Available", "25kg"], 
        available: true
    },
    "Dehyquart 4046": { 
        category: "Cosmetics", 
        partialUses: "Used as a conditioning agent in shampoos, hair conditioners, and other personal care products.", 
        packaging: ["Custom Packaging Available", "20kg"], 
        available: true
    },
    "Glyccor Mono Stearic (GMS)":{
        category: "Cosmetics", 
        partialUses: "Used as a conditioning agent in shampoos, hair conditioners, and other personal care products.", 
        packaging: ["Custom Packaging Available", "20kg"], 
        available: true
    },
    "Glycerin USP Grade": { 
        category: "Pharmaceuticals & Cosmetics", 
        partialUses: "Used in pharmaceuticals, cosmetics, food products, and as a humectant and solvent.", 
        packaging: ["5kg", "25kg"], 
        available: true
    },
    "Lanette Wax Ao": { 
        category: "Cosmetics", 
        partialUses: "Used in cosmetic formulations as an emulsifying agent, thickener, and emollient.", 
        packaging: ["Custom Packaging Available", "20kg"], 
        available: true
    },
    "Micro Slack Wax 160S": { 
        category: "Industrial", 
        partialUses: "Used in the production of candles, polishes, and as a lubricant in industrial applications.", 
        packaging: ["25kg"], 
        available: true
    },
    "Mono Propylene Glycol (MPG)": { 
        category: "Food & Industrial", 
        partialUses: "Used as a humectant in food, cosmetics, and pharmaceuticals, and in industrial applications.", 
        packaging: ["5kg", "20kg"], 
        available: true
    },
    "Paraffin Wax 58/60": { 
        category: "Food & Cosmetics", 
        partialUses: "Used in the manufacture of candles, coating food products, and in cosmetics and pharmaceuticals.", 
        packaging: ["25kg"], 
        available: true
    },
    "Stearic Acid": { 
       category: "Industrial & Cosmetics", 
       partialUses: "Used in the production of soaps, cosmetics, lubricants, and as a stabilizing agent in plastics.", 
       packaging: ["25kg"], 
        available: true
    },
    "White Oil": { 
       category: "Pharmaceuticals & Cosmetics", 
       partialUses: "Used in cosmetics, pharmaceuticals, and as a lubricant in industrial applications.", 
       packaging: ["1kg", "5kg", "20kg"], 
        available: true
    }
};
// Function to fetch synonyms using Gemini API
async function fetchSynonyms(productName) {
  try {
    const prompt = `List chemical synonyms for "${productName}" as comma-separated values:`;
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text
      .split(',')
      .map(s => s.trim().replace(/\.$/, ''))
      .filter(s => s.length > 0) || [];
  } catch (error) {
    console.error('Synonym fetch error:', error.message);
    return [];
  }
}

// Add AI-generated synonyms to products
(async () => {
  for (const [product, details] of Object.entries(productData)) {
    details.synonyms = await fetchSynonyms(product);
    console.log(`Synonyms for ${product}:`, details.synonyms);
  }
})();

// Configure fuzzy search
const fuseOptions = {
  keys: ['name', 'synonyms'],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true
};

const fuse = new Fuse(
  Object.entries(productData).map(([name, details]) => ({
    name,
    synonyms: details.synonyms || []
  })),
  fuseOptions
);

// Enhanced Query Handler
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message?.trim();
    if (!userMessage) return res.status(400).json({ error: "Message required" });

    // Handle greetings
    const greetings = ['hi', 'hello', 'hey', 'greetings'];
    if (greetings.some(greet => userMessage.toLowerCase().includes(greet))) {
      return res.json({ reply: "Hello! I'm JT, your chemicals expert. How can I assist you today? 😊" });
    }

    // Detect product queries
    const fuseResults = fuse.search(userMessage);
    const productMatch = fuseResults[0]?.score < 0.4 ? fuseResults[0].item.name : null;

    if (productMatch) {
      const details = productData[productMatch];
      
      // Build enhanced prompt
      const prompt = `As a chemical expert, explain "${userMessage}" focusing on:
        - Key applications in ${details.category}
        - Detailed safety protocols
        - Industry usage examples
        - Chemical properties
        Include technical details but keep explanations clear.`;

      try {
        const aiResponse = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: prompt }] }] },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const aiContent = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text 
          || "Additional details currently unavailable. Contact our technical team for more information.";

        return res.json({
          reply: `🧪 **${productMatch} Information**\n\n` +
                 `**Primary Uses:** ${details.partialUses}\n\n` +
                 `**Safety:** ${details.safety}\n\n` +
                 `**Technical Details:**\n${aiContent}`
        });
      } catch (aiError) {
        return res.json({
          reply: `🧪 **${productMatch} Information**\n\n` +
                 `**Primary Uses:** ${details.partialUses}\n\n` +
                 `**Safety:** ${details.safety}` +
                 `\n\n⚠️ Could not retrieve additional details at this time.`
        });
      }
    }

    // General chemical queries
    const generalPrompt = `As a chemical expert, answer: "${userMessage}". Include:
      - Key applications
      - Safety considerations
      - Industry relevance
      - Chemical properties
      Provide detailed but concise information.`;

    try {
      const generalResponse = await axios.post(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: generalPrompt }] }] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const responseText = generalResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text 
        || "Could you please rephrase your question? I want to ensure I provide the most accurate information.";

      return res.json({ reply: responseText });
    } catch (error) {
      return res.status(500).json({ error: "Technical service unavailable. Please try again later." });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server operational on port ${PORT}`);
  console.log(`Gemini API Status: ${GEMINI_API_KEY ? 'Active' : 'Inactive'}`);
});
