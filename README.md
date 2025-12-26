# 🤝 Código Solidário

> **"Transformando linhas de código em alimento para a comunidade."**

![React](https://img.shields.io/badge/React-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Status](https://img.shields.io/badge/Status-MVP_Aprovado-success?style=for-the-badge)

## 📖 Sobre o Projeto

O **Código Solidário** é um projeto de extensão tecnológica desenvolvido no **IFAL - Campus Rio Largo**.

O objetivo é duplo: combater a evasão escolar e auxiliar no combate à fome. O sistema gerencia a arrecadação de alimentos doados pelos alunos como contrapartida social para participação em cursos de tecnologia.

O sistema garante **Transparência Total** (através de um Dashboard público) e **Segurança de Dados** (através de uma área de gestão restrita).

---

## 🚀 Funcionalidades

### 📊 Painel de Transparência (Público)
- **Metas em Tempo Real:** Barra de progresso visual mostrando o atingimento da meta trimestral.
- **Ciclos Dinâmicos:** O sistema calcula automaticamente o encerramento do ciclo (Trimestral) baseada na data atual.
- **Auditoria:** Listagem das últimas doações para conferência pública.
- **KPIs:** Cards com Total Arrecadado, Alunos Ativos e Próxima Entrega.

### 🛡️ Área de Gestão (Restrita)
- **Login Seguro:** Autenticação via **Google (Firebase Auth)**. Apenas monitores autorizados têm acesso.
- **Cadastro Flexível:** Adição de múltiplos itens em uma única doação (Ex: 1kg Arroz + 1kg Feijão).
- **Controle de Estoque:** Visualização do inventário agrupado por tipo de alimento.
- **CRUD:** Permite adicionar e remover registros, atualizando o dashboard instantaneamente.

---

## 🧠 Arquitetura do Projeto

Este software foi desenvolvido com foco em escalabilidade, segurança e experiência do usuário, seguindo quatro pilares fundamentais:

1.  **Planejamento Estratégico:** Definição clara de escopo para unir tecnologia e responsabilidade social.
2.  **Segurança e Compliance:** Implementação rigorosa de Autenticação (OAuth) e Regras de Segurança no banco de dados para integridade dos dados.
3.  **User Experience (UX):** Interface limpa e intuitiva, priorizando a visualização de dados (Data Visualization) para transparência pública.
4.  **Entrega Contínua:** Foco em um produto funcional (MVP) de alta disponibilidade para uso real na instituição.

---

## 🛠️ Tecnologias Utilizadas

* **Frontend:** React.js (Vite)
* **Estilização:** TailwindCSS
* **Ícones:** Lucide React
* **Backend as a Service:** Firebase (Google)
    * *Firestore Database:* Banco de dados NoSQL em tempo real.
    * *Authentication:* Gestão de identidade e acesso.
* **Deploy:** Netlify (Em breve)

---

## 💻 Como Rodar o Projeto Localmente

Siga os passos abaixo para ter o sistema rodando na sua máquina:

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado.

### 2. Clonar o Repositório

    git clone https://github.com/carlos-andemberg/codigo-solidario.git
    cd codigo-solidario

### 3. Instalar Dependências

    npm install

### 4. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto e adicione suas credenciais do Firebase:

    VITE_API_KEY=sua_api_key
    VITE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
    VITE_PROJECT_ID=seu_projeto_id
    VITE_STORAGE_BUCKET=seu_projeto.appspot.com
    VITE_MESSAGING_SENDER_ID=seu_sender_id
    VITE_APP_ID=seu_app_id

### 5. Rodar o Servidor

    npm run dev

O projeto estará rodando em `http://localhost:5173`.

---


## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">
  <p>Desenvolvido com 💚 por Carlos Andemberg</p>
  <p>IFAL - Instituto Federal de Alagoas</p>
</div>