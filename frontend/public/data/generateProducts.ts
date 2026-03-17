import * as fs from "fs";


type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  image: string
}

const API_KEY = "27776674-0d39149be41d3e46ad0f3efce"

const foods: string[] = [
  "arroz", "feijao", "macarrao", "leite", "queijo", "maca", "banana", "tomate",
  "batata", "cenoura", "frango", "carne", "peixe", "ovo", "alface", "brocolis",
  "pepino", "cebola", "alho", "laranja", "uva", "abacaxi", "manga", "pera",
  "melancia", "morango", "pao", "bolo", "pizza", "hamburguer", "iogurte",
  "manteiga", "requeijao", "milho", "ervilha", "lentilha", "grao de bico"
]

function randomPrice(): number {
  return Number((Math.random() * 40 + 3).toFixed(2))
}

function randomStock(): number {
  return Math.floor(Math.random() * 200) + 10
}

function generateBarcode(): string {
  return "789" + Math.floor(Math.random() * 10000000000)
}

async function getImage(food: string): Promise<string> {

  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${encodeURIComponent(food)}&image_type=photo&per_page=3`

  const res = await fetch(url)
  const data = await res.json()

  if (data.hits && data.hits.length > 0) {
    return data.hits[0].webformatURL
  }

  return "https://pixabay.com/images/search/food/"
}

async function generateProducts(total: number): Promise<void> {

  const products: Product[] = []

  for (let i = 0; i < total; i++) {

    const food = foods[Math.floor(Math.random() * foods.length)]!
    const image = await getImage(food)

    const product: Product = {
      id: generateBarcode(),
      name: food.charAt(0).toUpperCase() + food.slice(1),
      category: "Alimentos",
      price: randomPrice(),
      stock: randomStock(),
      image: image
    }

    products.push(product)

    console.log(`gerado ${i + 1}/${total}`)
  }

  fs.writeFileSync("produtos.json", JSON.stringify(products, null, 2))

  console.log("Arquivo produtos.json criado!")
}

generateProducts(1000)