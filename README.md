# melanin-rx

## Project Overview

This repository contains a full-stack Ionic React application built with TypeScript and Vite.  
The project integrates Firebase for hosting, authentication, and backend functions, and uses GitHub Actions for automated CI/CD deployment.

---

## Frameworks and Setup

- **Frontend Framework:** Ionic React (v8.5.0) with React 19  
- **Routing:** React Router v5  
- **Build Tool:** Vite (v5.2)  
- **Language:** TypeScript  
- **Backend / Cloud:** Firebase Hosting and Functions  
- **CI/CD:** GitHub Actions with Firebase CLI for automated builds and deployments  

---

## Installed Packages

**Core Dependencies**
- `@ionic/react`, `@ionic/react-router` – UI components and routing  
- `react`, `react-dom` – Core React libraries  
- `react-router`, `react-router-dom` – Page routing  
- `firebase` – Hosting, authentication, and database  
- `ionicons` – Icon library  
- `@capacitor/*` – Native device features (haptics, keyboard, status bar)

**Development & Testing**
- `vite`, `typescript` – Build and compile  
- `vitest`, `cypress` – Unit and end-to-end testing  
- `eslint`, `typescript-eslint` – Code linting  
- `@testing-library/react`, `@testing-library/jest-dom` – Component testing utilities  

---

## CI/CD Setup

This project includes two GitHub Actions workflows for deployment automation:

1. **Deploy to Live** – Automatically runs on every push to the `dev` branch  
   - Installs dependencies  
   - Builds the app  
   - Deploys to Firebase Hosting (channel: `live`)  

2. **Deploy to Preview** – Runs on pull requests  
   - Builds the app and creates a temporary preview URL for testing  

Both workflows use the Firebase CLI via the `FirebaseExtended/action-hosting-deploy` GitHub Action, authenticated through repository secrets.
