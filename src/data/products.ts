import HibiscusImg from "@/assets/Hibiscus-Flower.jpg";
import OliveOilImg from "@/assets/Olive-Oil.jpg";
import MoringaImg from "@/assets/Moringa-Leaves.jpeg";
import MasticGumImg from "@/assets/Mastic-gum.jpg";
import KalonjiImg from "@/assets/Kalonji-oil.jpg";
import AftabiShilajitImg from "@/assets/Aftabi-Shilajit.jpg";
import AmlaImg from "@/assets/Amlaoil.jpeg";
import DandelionImg from "@/assets/Dandelion-Tea.jpg";
import DesiHaldiImg from "@/assets/Desi-haldi.jpg";
import GreenTeaImg from "@/assets/GreenTea.jpg";
import GondKatiraImg from "@/assets/GondKatira.jpg";
import HappyTummyImg from "@/assets/Happy-tummy.jpg";
import AshwagandhaImg from "@/assets/Ashwagandha.jpg";
import VitalityBoosterImg from "@/assets/vitality-booster.jpg";
import ZafranImg from "@/assets/cat-zafran.jpg";

export interface Product {
  id: string;
  name: string;
  desc: string;
  category: string;
  status: "active" | "draft" | "archived";
  stock: number;
  price: number;
  priceFormatted: string;
  created: string;
  image: string;
}

export const allProducts: Product[] = [
  { id: "isabgol-001", name: "Isabgol- Ispaghol Husk", desc: "Natural psyllium husk for digestive regularity.", category: "Remedies", status: "active", stock: 120, price: 480, priceFormatted: "PKR 480", created: "Jan 10, 2026", image: HappyTummyImg },
  { id: "happy-tummy-001", name: "Happy Tummy", desc: "Digestive support blend for bloating and gut comfort.", category: "Remedies", status: "active", stock: 95, price: 350, priceFormatted: "PKR 350", created: "Jan 12, 2026", image: HappyTummyImg },
  { id: "ashwagandha-001", name: "Ashwagandha", desc: "Adaptogenic herb for stress and vitality support.", category: "Herb", status: "active", stock: 140, price: 600, priceFormatted: "PKR 600", created: "Jan 14, 2026", image: AshwagandhaImg },
  { id: "olive-oil-001", name: "Cold Pressed Extra Virgin Olive Oil - Vitamin E, Vitamin D & Vitamin K", desc: "Cold-pressed olive oil for heart and skin wellness.", category: "Oils", status: "active", stock: 70, price: 2500, priceFormatted: "PKR 2,500", created: "Jan 16, 2026", image: OliveOilImg },
  { id: "turmeric-001", name: "Turmeric Powder (Desi Amba Haldi Powder)", desc: "Traditional turmeric powder for antioxidant support.", category: "Herb", status: "active", stock: 150, price: 350, priceFormatted: "PKR 350", created: "Jan 18, 2026", image: DesiHaldiImg },
  { id: "piles-care-001", name: "Piles Care Oil - Deep Penetration & Natural Relief For Hemorrhoids", desc: "Targeted herbal oil for local soothing relief.", category: "Oils", status: "active", stock: 45, price: 2400, priceFormatted: "PKR 2,400", created: "Jan 20, 2026", image: KalonjiImg },
  { id: "hair-scalp-oil-001", name: "Hair & Scalp Treatment Oil", desc: "Nourishing oil for scalp and hair roots.", category: "Oils", status: "active", stock: 60, price: 2000, priceFormatted: "PKR 2,000", created: "Jan 22, 2026", image: AmlaImg },
  { id: "shatawari-001", name: "Shatawari | Satawar", desc: "Classic herbal root for wellness and stamina.", category: "Herb", status: "active", stock: 82, price: 1000, priceFormatted: "PKR 1,000", created: "Jan 24, 2026", image: VitalityBoosterImg },
  { id: "pain-therapist-001", name: "Pain Therapist", desc: "Herbal support for muscle comfort and recovery.", category: "Remedies", status: "active", stock: 74, price: 1350, priceFormatted: "PKR 1,350", created: "Jan 26, 2026", image: GondKatiraImg },
  { id: "hair-nourishing-oil-001", name: "Hair Nourishing Oil", desc: "Hair oil blend for shine and nourishment.", category: "Oils", status: "active", stock: 65, price: 1750, priceFormatted: "PKR 1,750", created: "Jan 28, 2026", image: AmlaImg },
  { id: "vitality-booster-001", name: "Vitality Booster", desc: "Daily vitality and stamina herbal blend.", category: "Herb", status: "active", stock: 90, price: 1000, priceFormatted: "PKR 1,000", created: "Jan 30, 2026", image: VitalityBoosterImg },
  { id: "dandelion-tea-001", name: "Dandelion Tea", desc: "Botanical tea for digestive and liver support.", category: "Teas", status: "active", stock: 115, price: 450, priceFormatted: "PKR 450", created: "Feb 01, 2026", image: DandelionImg },
  { id: "beard-craft-001", name: "Beard Craft Growth Oil – Fast Beard Growth Formula", desc: "Beard growth oil for fuller beard care.", category: "Oils", status: "active", stock: 42, price: 1350, priceFormatted: "PKR 1,350", created: "Feb 03, 2026", image: AmlaImg },
  { id: "dry-amla-001", name: "Dry Amla Powder - Revive Your Hair, Skin & Health", desc: "Amla powder rich in vitamin C and antioxidants.", category: "Herb", status: "active", stock: 108, price: 700, priceFormatted: "PKR 700", created: "Feb 05, 2026", image: AmlaImg },
  { id: "safed-musli-001", name: "Safed Musli (White Musli) – Natural Vitality Booster", desc: "Traditional vitality herb for strength support.", category: "Herb", status: "active", stock: 56, price: 1800, priceFormatted: "PKR 1,800", created: "Feb 07, 2026", image: VitalityBoosterImg },
  { id: "chamomile-001", name: "Chamomile Tea", desc: "Calming tea for relaxation and bedtime use.", category: "Teas", status: "active", stock: 84, price: 500, priceFormatted: "PKR 500", created: "Feb 09, 2026", image: HibiscusImg },
  { id: "kaunch-powder-001", name: "Kaunch Seeds Powder – Natural Strength & Vitality Booster", desc: "Herbal powder for strength and vitality support.", category: "Herb", status: "active", stock: 88, price: 550, priceFormatted: "PKR 550", created: "Feb 11, 2026", image: AshwagandhaImg },
  { id: "castor-oil-001", name: "Castor Oil (Raw & Coldpress)", desc: "Raw cold-pressed castor oil for skin and hair use.", category: "Oils", status: "active", stock: 77, price: 750, priceFormatted: "PKR 750", created: "Feb 13, 2026", image: KalonjiImg },
  { id: "ginger-garlic-001", name: "Ginger Garlic - Marinade Masala", desc: "Flavorful marinade masala for healthy cooking.", category: "Spices", status: "active", stock: 124, price: 400, priceFormatted: "PKR 400", created: "Feb 15, 2026", image: DesiHaldiImg },
  { id: "sea-salt-001", name: "Sea Salt (Sambar Or Sumandri Namak)", desc: "Natural sea salt for everyday seasoning.", category: "Salts", status: "active", stock: 128, price: 450, priceFormatted: "PKR 450", created: "Feb 17, 2026", image: DesiHaldiImg },
  { id: "ceylon-cinnamon-001", name: "Ceylon Cinnamon Sticks", desc: "Premium cinnamon sticks for teas and meals.", category: "Spices", status: "active", stock: 109, price: 400, priceFormatted: "PKR 400", created: "Feb 19, 2026", image: DesiHaldiImg },
  { id: "aftabi-shilajit-001", name: "100% Pure Aftabi Shilajit", desc: "Pure shilajit resin for energy and recovery.", category: "Shilajit", status: "active", stock: 52, price: 1500, priceFormatted: "PKR 1,500", created: "Feb 21, 2026", image: AftabiShilajitImg },
  { id: "ashwagandha-caps-001", name: "Ashwagandha Powder Capsules", desc: "Convenient ashwagandha capsules for stress support.", category: "Capsules", status: "active", stock: 93, price: 600, priceFormatted: "PKR 600", created: "Feb 23, 2026", image: AshwagandhaImg },
  { id: "himalayan-salt-001", name: "Himalayan Pink Salt", desc: "Natural pink salt for mineral-rich seasoning.", category: "Salts", status: "active", stock: 136, price: 200, priceFormatted: "PKR 200", created: "Feb 24, 2026", image: DesiHaldiImg },
  { id: "safed-musli-caps-001", name: "Safed Musli Capsules", desc: "Capsule form for vitality and stamina support.", category: "Capsules", status: "active", stock: 96, price: 900, priceFormatted: "PKR 900", created: "Feb 25, 2026", image: VitalityBoosterImg },
  { id: "mastic-gum-001", name: "Mastic Gum ( Mastagi Roomi )", desc: "Natural resin for digestive comfort support.", category: "Remedies", status: "active", stock: 63, price: 1500, priceFormatted: "PKR 1,500", created: "Feb 26, 2026", image: MasticGumImg },
  { id: "hibiscus-tea-001", name: "Hibiscus Tea (Gudhal) – Natural & Caffeine Free", desc: "Caffeine-free floral tea rich in antioxidants.", category: "Teas", status: "active", stock: 111, price: 750, priceFormatted: "PKR 750", created: "Feb 27, 2026", image: HibiscusImg },
  { id: "fresh-curry-patta-001", name: "Fresh Curry Patta", desc: "Fresh curry leaves for healthy cooking.", category: "Fresh", status: "active", stock: 101, price: 500, priceFormatted: "PKR 500", created: "Feb 28, 2026", image: MoringaImg },
  { id: "hibiscus-flower-powder-001", name: "Hibiscus Flower (Powder)", desc: "Fine hibiscus powder for tea and care recipes.", category: "Herb", status: "active", stock: 87, price: 400, priceFormatted: "PKR 400", created: "Mar 01, 2026", image: HibiscusImg },
  { id: "valerian-root-001", name: "Valerian Root Powder - Natural Sleep & Relaxation Aid", desc: "Herbal powder commonly used for relaxation.", category: "Herb", status: "active", stock: 73, price: 850, priceFormatted: "PKR 850", created: "Mar 02, 2026", image: AshwagandhaImg },
  { id: "amla-capsules-001", name: "Pure Amla Powder Capsules – Natural Vitamin C & Immunity Booster", desc: "Amla capsules for daily immunity support.", category: "Capsules", status: "active", stock: 89, price: 750, priceFormatted: "PKR 750", created: "Mar 03, 2026", image: AmlaImg },
  { id: "moringa-powder-001", name: "Moringa Leaves Powder (Suhanjna) - Doctor Tree Leaves", desc: "Nutrient-dense moringa powder for wellness.", category: "Herb", status: "active", stock: 132, price: 300, priceFormatted: "PKR 300", created: "Mar 04, 2026", image: MoringaImg },
  { id: "shakakul-mishri-001", name: "Shakakul Mishri | Parsnip - (Powder)", desc: "Traditional parsnip powder for daily wellness.", category: "Herb", status: "active", stock: 85, price: 400, priceFormatted: "PKR 400", created: "Mar 04, 2026", image: AshwagandhaImg },
  { id: "kaunch-capsules-001", name: "Kaunch Seeds Powder Capsules", desc: "Capsule format of kaunch seeds for vitality.", category: "Capsules", status: "active", stock: 79, price: 650, priceFormatted: "PKR 650", created: "Mar 04, 2026", image: VitalityBoosterImg },
  { id: "chinese-green-tea-001", name: "Chinese Green Tea (Chun Mee) - Natural Fat Burner", desc: "Green tea blend for metabolism and focus support.", category: "Teas", status: "active", stock: 112, price: 450, priceFormatted: "PKR 450", created: "Mar 04, 2026", image: GreenTeaImg },
  { id: "piplee-001", name: "Piplee (Pipal) Peepal Tree", desc: "Traditional piplee herb used in herbal wellness.", category: "Herb", status: "active", stock: 91, price: 400, priceFormatted: "PKR 400", created: "Mar 04, 2026", image: AshwagandhaImg },
  { id: "fresh-swjana-001", name: "Fresh Swajna (Moringa) Leaves", desc: "Fresh moringa leaves for cooking and nutrition.", category: "Fresh", status: "active", stock: 90, price: 450, priceFormatted: "PKR 450", created: "Mar 04, 2026", image: MoringaImg },
  { id: "triphala-powder-001", name: "Triphala Churan Powder – Traditional Ayurvedic Herbal Formula", desc: "Traditional triphala powder for digestion and detox.", category: "Herb", status: "active", stock: 106, price: 700, priceFormatted: "PKR 700", created: "Mar 04, 2026", image: HappyTummyImg },
  { id: "kalonji-oil-001", name: "Black Seed | Kalonji Oil (Coldpress)", desc: "Cold-pressed black seed oil for immunity and skin.", category: "Oils", status: "active", stock: 94, price: 700, priceFormatted: "PKR 700", created: "Mar 04, 2026", image: KalonjiImg },
  { id: "gond-katira-001", name: "Gond Katira (Tragacanth Gum) - Pure Natural Herbal Gum", desc: "Cooling tragacanth gum for digestive and hydration support.", category: "Remedies", status: "active", stock: 99, price: 550, priceFormatted: "PKR 550", created: "Mar 04, 2026", image: GondKatiraImg },
  { id: "beef-tallow-001", name: "Beef Tallow", desc: "Traditional rendered tallow for cooking and care uses.", category: "Remedies", status: "active", stock: 62, price: 900, priceFormatted: "PKR 900", created: "Mar 04, 2026", image: OliveOilImg },
  { id: "triphala-capsules-001", name: "Triphala Churan Capsules – Ayurvedic Digestive & Detox Support", desc: "Capsule form of triphala for digestive support.", category: "Capsules", status: "active", stock: 84, price: 1200, priceFormatted: "PKR 1,200", created: "Mar 04, 2026", image: HappyTummyImg },
  { id: "dhaga-mishri-001", name: "Dhaga Mishri (Thread Rock Sugar)", desc: "Traditional thread rock sugar for herbal uses.", category: "Remedies", status: "active", stock: 137, price: 350, priceFormatted: "PKR 350", created: "Mar 04, 2026", image: DesiHaldiImg },
  { id: "neem-powder-001", name: "Neem Powder (Azadirachta Indica) - Herbal Cleanser & Detoxifier", desc: "Neem powder for detox and skin wellness routines.", category: "Herb", status: "active", stock: 114, price: 300, priceFormatted: "PKR 300", created: "Mar 04, 2026", image: AshwagandhaImg },
  { id: "wild-mint-tea-001", name: "Wild Mint Tea (Safed Pudina) - Natural & Dried", desc: "Refreshing dried mint tea for digestive comfort.", category: "Teas", status: "active", stock: 118, price: 350, priceFormatted: "PKR 350", created: "Mar 04, 2026", image: GreenTeaImg },
  { id: "moringa-capsules-001", name: "Moringa Leaves Powder (Suhanjna) - Capsules", desc: "Moringa capsules for immunity and energy support.", category: "Capsules", status: "active", stock: 97, price: 600, priceFormatted: "PKR 600", created: "Mar 04, 2026", image: MoringaImg },
  { id: "zaffran-001", name: "Zaffran", desc: "Premium saffron strands for wellness and culinary use.", category: "Herb", status: "active", stock: 41, price: 3900, priceFormatted: "PKR 3,900", created: "Mar 04, 2026", image: ZafranImg },
];
