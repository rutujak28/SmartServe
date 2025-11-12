// Import all menu item images
import alooParatha from '@/assets/menu/aloo-paratha.jpg';
import butterPavBhaji from '@/assets/menu/butter-pav-bhaji.jpg';
import cheeseMasalaDosa from '@/assets/menu/cheese-masala-dosa.jpg';
import cheesePaneerParatha from '@/assets/menu/cheese-paneer-paratha.jpg';
import cheeseParatha from '@/assets/menu/cheese-paratha.jpg';
import cheesePavBhaji from '@/assets/menu/cheese-pav-bhaji.jpg';
import choleBhature from '@/assets/menu/chole-bhature.jpg';
import choleRice from '@/assets/menu/chole-rice.jpg';
import coffee from '@/assets/menu/coffee.jpg';
import coldCoffee from '@/assets/menu/cold-coffee.jpg';
import cuttingTea from '@/assets/menu/cutting-tea.jpg';
import dalRice from '@/assets/menu/dal-rice.jpg';
import fullTea from '@/assets/menu/full-tea.jpg';
import gobhiParatha from '@/assets/menu/gobhi-paratha.jpg';
import hakkaNoodles from '@/assets/menu/hakka-noodles.jpg';
import hotSourSoup from '@/assets/menu/hot-sour-soup.jpg';
import idliSambar from '@/assets/menu/idli-sambar.jpg';
import masalaDosa from '@/assets/menu/masala-dosa.jpg';
import masalaPav from '@/assets/menu/masala-pav.jpg';
import meduWadaSambar from '@/assets/menu/medu-wada-sambar.jpg';
import methiParatha from '@/assets/menu/methi-paratha.jpg';
import misalPav from '@/assets/menu/misal-pav.jpg';
import onionUttappa from '@/assets/menu/onion-uttappa.jpg';
import paneerBiryani from '@/assets/menu/paneer-biryani.jpg';
import paneerChilly from '@/assets/menu/paneer-chilly.jpg';
import paneerFrankie from '@/assets/menu/paneer-frankie.jpg';
import paneerParatha from '@/assets/menu/paneer-paratha.jpg';
import puriBhaji from '@/assets/menu/puri-bhaji.jpg';
import sadaDosa from '@/assets/menu/sada-dosa.jpg';
import schezwanFriedRice from '@/assets/menu/schezwan-fried-rice.jpg';
import specialCoffee from '@/assets/menu/special-coffee.jpg';
import specialTea from '@/assets/menu/special-tea.jpg';
import sweetCornSoup from '@/assets/menu/sweet-corn-soup.jpg';
import upma from '@/assets/menu/upma.jpg';
import usalPav from '@/assets/menu/usal-pav.jpg';
import vegBiryani from '@/assets/menu/veg-biryani.jpg';
import vegFrankie from '@/assets/menu/veg-frankie.jpg';
import vegFriedRice from '@/assets/menu/veg-fried-rice.jpg';
import vegManchowSoup from '@/assets/menu/veg-manchow-soup.jpg';
import vegNoodles from '@/assets/menu/veg-noodles.jpg';
import vegPulav from '@/assets/menu/veg-pulav.jpg';
import vegSandwich from '@/assets/menu/veg-sandwich.jpg';

// Create a mapping object for easy lookup
export const menuImageMapping: Record<string, string> = {
  'aloo paratha': alooParatha,
  'butter pav bhaji': butterPavBhaji,
  'cheese masala dosa': cheeseMasalaDosa,
  'cheese paneer paratha': cheesePaneerParatha,
  'cheese paratha': cheeseParatha,
  'cheese pav bhaji': cheesePavBhaji,
  'chole bhature': choleBhature,
  'chole rice': choleRice,
  'coffee': coffee,
  'cold coffee': coldCoffee,
  'cutting tea': cuttingTea,
  'dal rice': dalRice,
  'full tea': fullTea,
  'gobhi paratha': gobhiParatha,
  'hakka noodles': hakkaNoodles,
  'hot & sour soup': hotSourSoup,
  'hot sour soup': hotSourSoup,
  'idli sambar': idliSambar,
  'masala dosa': masalaDosa,
  'masala pav': masalaPav,
  'medu wada sambar': meduWadaSambar,
  'methi paratha': methiParatha,
  'misal pav': misalPav,
  'onion uttappa': onionUttappa,
  'paneer biryani': paneerBiryani,
  'paneer chilly': paneerChilly,
  'paneer frankie': paneerFrankie,
  'paneer paratha': paneerParatha,
  'puri bhaji': puriBhaji,
  'sada dosa': sadaDosa,
  'schezwan fried rice': schezwanFriedRice,
  'special coffee': specialCoffee,
  'special tea': specialTea,
  'sweet corn soup': sweetCornSoup,
  'upma': upma,
  'usal pav': usalPav,
  'veg biryani': vegBiryani,
  'veg frankie': vegFrankie,
  'veg fried rice': vegFriedRice,
  'veg manchow soup': vegManchowSoup,
  'veg noodles': vegNoodles,
  'veg pulav': vegPulav,
  'veg sandwich': vegSandwich,
};

// Helper function to get image URL by name
export const getMenuItemImage = (name: string): string | undefined => {
  const normalizedName = name.toLowerCase().trim();
  return menuImageMapping[normalizedName];
};
