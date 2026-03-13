## 🚀 Dispensa Virtual Express

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-10.x-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)

> Plataforma de e-commerce para compra de alimentos ou produtos de limpeza. Com foco no consumidor que seja comprar o alimento e também á quem deseja vender seus produtos. 

## 🚀 Funcionalidades
- 🔐 Login e registro com email/senha
- 🍔 Compra de produtos
- 🚎 Acompanhamento de pedidos
- 📤 Venda de mercadoria
- 💶 Plataforma de pagamento


## 🛠️ Tecnologias Utilizadas
- **React 18** - Biblioteca para construção da interface
- **TypeScript** - Tipagem estática e segurança no código
- **Firebase Authentication** - Autenticação de usuários
- **Firebase Firestore** - Banco de dados NoSQL em tempo real
- **Vite** - Build tool ultra-rápida
- **Tailwind css** - Estilização moderna com gradientes e animações


## 📁 Estrutura do Projeto

└── frontend
    ├── README.md
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   ├── data
    │   │   ├── generateProducts.ts
    │   │   ├── package-lock.json
    │   │   ├── package.json
    │   │   ├── products.json
    │   │   └── tsconfig.json
    │   └── vite.svg
    ├── src
    │   ├── App.tsx
    │   ├── assets
    │   ├── components
    │   │   ├── Footer.tsx
    │   │   ├── Header.tsx
    │   │   ├── Layout.tsx
    │   │   ├── NutritionLabel.tsx
    │   │   ├── PrivateRoute.tsx
    │   │   ├── ProductScores.tsx
    │   │   └── Productcard.tsx
    │   ├── hooks
    │   ├── index.css
    │   ├── lib
    │   │   ├── config.ts
    │   │   └── firebase
    │   │       ├── authService.ts
    │   │       ├── config
    │   │       │   ├── authService.ts
    │   │       │   └── firebaseService.ts
    │   │       └── firebaseService.ts
    │   ├── main.tsx
    │   ├── pages
    │   │   ├── Account
    │   │   │   ├── Login.tsx
    │   │   │   ├── Profile.tsx
    │   │   │   └── Register.tsx
    │   │   ├── Cart.tsx
    │   │   ├── Catalog.tsx
    │   │   ├── Checkout.tsx
    │   │   ├── Funcionalidade.tsx
    │   │   ├── Home.tsx
    │   │   ├── Orders.tsx
    │   │   ├── Privacidade.tsx
    │   │   ├── ProdutoDetail.tsx
    │   │   └── Termos.tsx
    │   ├── services
    │   │   ├── api.ts
    │   │   ├── authService.ts
    │   │   ├── categoryService.ts
    │   │   ├── fatSecret.ts
    │   │   ├── openFoodFacts.ts
    │   │   └── productService.ts
    │   ├── stores
    │   │   ├── authStore.ts
    │   │   └── cartStore.ts
    │   └── types
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts

