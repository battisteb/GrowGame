# Guide des Animations - GrowGame

> Comment les animations fonctionnent et comment les modifier/améliorer

---

## 📚 Architecture Actuelle

### API Utilisée: React.Animated (Natif)

L'application utilise l'API standard React Native `Animated` pour toutes les animations.

**Avantages**:

- ✅ Zéro dépendances natives problématiques
- ✅ API stable et bien documentée
- ✅ Compatible Expo Go
- ✅ Performance optimisée

**Limitations**:

- ⚠️ Pas d'interpolation complexe (celles sont limitées)
- ⚠️ Interactions gestuelles avancées plus difficiles

---

## 🎬 Composants Animés

### 1. XPToast.tsx - Notifications XP

**Où**: `src/components/XPToast.tsx`  
**Quoi**: Notifications flottantes quand l'utilisateur gagne du XP

```typescript
// Déclaration
const translateY = new Animated.Value(-80); // Position initiale
const opacity = new Animated.Value(0); // Invisibilité
const scale = new Animated.Value(0.8); // Taille

// Animation d'entrée
Animated.parallel([
  Animated.timing(translateY, {
    toValue: 0, // Glisser vers le bas
    duration: 300,
    useNativeDriver: true,
  }),
  Animated.timing(opacity, {
    toValue: 1, // Devenir visible
    duration: 200,
    useNativeDriver: true,
  }),
  Animated.sequence([
    // Séquence: saut
    Animated.timing(scale, { toValue: 1.1, duration: 200 }),
    Animated.timing(scale, { toValue: 1, duration: 150 }),
  ]),
]).start();

// Animation de sortie (après 1.8s)
Animated.parallel([
  Animated.timing(translateY, { toValue: -80, duration: 300 }),
  Animated.timing(opacity, { toValue: 0, duration: 200 }),
]).start();
```

**Paramètres**:

- `duration: 300` - Durée en ms
- `useNativeDriver: true` - Exécution optimisée

---

### 2. LeaderboardCard.tsx - Entrée du Classement

**Où**: `src/components/LeaderboardCard.tsx`  
**Quoi**: Les rangées du classement apparaissent progressivement

```typescript
// Animations avec délai progressif
const opacity = new Animated.Value(0);
const translateY = new Animated.Value(12); // Décalage initial

Animated.parallel([
  Animated.timing(opacity, {
    toValue: 1,
    duration: 300,
    delay: index * 60, // ⭐ Chaque rangée démarre 60ms plus tard
    useNativeDriver: true,
  }),
  Animated.timing(translateY, {
    toValue: 0,
    duration: 300,
    delay: index * 60,
    useNativeDriver: true,
  }),
]).start();
```

**Effet**: Cascade fluide (les rangées apparaissent une à une)

---

### 3. XPProgressBar.tsx - Barre de Progression

**Où**: `src/components/XPProgressBar.tsx`  
**Quoi**: Animation de la barre XP vers le prochain niveau

```typescript
const animatedWidth = new Animated.Value(0);

Animated.timing(animatedWidth, {
  toValue: progress, // 0-100 (pourcentage)
  duration: 600,
  useNativeDriver: false, // ⚠️ Interpolation nécessite false
}).start();

// Conversion en pourcentage
const animatedBarStyle = {
  width: animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  }),
};
```

**Note**: `useNativeDriver: false` nécessaire pour `interpolate()`

---

### 4. habits.tsx - Animations de Coches

**Où**: `app/(tabs)/habits.tsx`  
**Quoi**: Feedback quand l'utilisateur coche une habitude

```typescript
const checkScale = new Animated.Value(1);
const cardScale = new Animated.Value(1);

// Animation du check (✓)
Animated.sequence([
  Animated.spring(checkScale, {
    toValue: 1.3,
    friction: 4, // Bounciness (bas = plus bounce)
    tension: 300, // Vitesse (haut = plus vite)
    useNativeDriver: true,
  }),
  Animated.spring(checkScale, {
    toValue: 1,
    friction: 8,
    tension: 200,
    useNativeDriver: true,
  }),
]).start();

// Animation de la carte (squish effect)
Animated.sequence([
  Animated.spring(cardScale, {
    toValue: 0.97, // Squish à 97%
    friction: 10,
    tension: 400,
    useNativeDriver: true,
  }),
  Animated.spring(cardScale, {
    toValue: 1,
    friction: 8,
    tension: 200,
    useNativeDriver: true,
  }),
]).start();
```

**Paramètres Spring**:

- `friction`: 1-20 (bas = plus oscillant)
- `tension`: 1-300 (haut = plus rigide)

---

## 📖 Concepts Clés

### Animated.Value

```typescript
const value = new Animated.Value(initialValue);
```

Stocke la valeur animée. **Persiste** pendant toute la durée du composant.

### Animated.timing

```typescript
Animated.timing(value, {
  toValue: 100,
  duration: 1000,
  useNativeDriver: true, // true = fast, false = plus features
}).start(callback);
```

Animation linéaire simple (A → B en X ms).

### Animated.spring

```typescript
Animated.spring(value, {
  toValue: 100,
  friction: 7, // Oscillation
  tension: 40, // Vitesse
  useNativeDriver: true,
}).start();
```

Animation physique (rebond naturel).

### Animated.sequence

```typescript
Animated.sequence([
  Animated.timing(...),
  Animated.timing(...),
]).start();
```

Une après l'autre (A → B → C).

### Animated.parallel

```typescript
Animated.parallel([
  Animated.timing(...),
  Animated.timing(...),
]).start();
```

Toutes en même temps (A||B||C).

### interpolate

```typescript
animatedValue.interpolate({
  inputRange: [0, 100],
  outputRange: ["-50%", "50%"],
});
```

Convertir une valeur (0-100) en une autre (position, couleur, etc).

---

## 🎨 Amélirations Futures

### Si animations complexes nécessaires:

**Option 1**: Créer Development Build

```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

Alors re-intégrer `react-native-reanimated`:

```bash
npm install react-native-reanimated@4.1.1
```

**Option 2**: Utiliser `react-native-svg` + `Animated`
Pour les morphing shapes et designs complexes.

---

## 🔍 Debug des Animations

### Ralentir les animations

```typescript
// Dans votre composant
const animationDuration = __DEV__ ? 3000 : 300; // 3s en dev, 300ms en prod

Animated.timing(value, {
  toValue: 100,
  duration: animationDuration, // ← Utiliser cette variable
}).start();
```

### Voir les valeurs animées

```typescript
// S'abonner aux changements
let listener = animatedValue.addListener(({ value }) => {
  console.log("Valeur actuelle:", value);
});

// Plus tard: arrêter
animatedValue.removeListener(listener);
```

### Performance: Profiler

```
Open Inspector → Performance → Animations
```

---

## 📚 Ressources

- [React Native Animated Docs](https://reactnative.dev/docs/animated)
- [Animated API Reference](https://reactnative.dev/docs/animated#api)
- [Easing Functions](https://reactnative.dev/docs/easing)

---

## ✅ Checklist pour Ajouter une Animation

- [ ] Créer `new Animated.Value(initialValue)` pour chaque propriété
- [ ] Wrapper le composant animé avec `<Animated.View>`
- [ ] Utiliser `Animated.timing()` ou `Animated.spring()`
- [ ] Appeler `.start()` à la fin
- [ ] Tester avec `useNativeDriver: true` d'abord (plus rapide)
- [ ] Si ça ne marche pas, essayer `useNativeDriver: false`
- [ ] Vérifier performance sur appareil vrai

---

**Dernière mise à jour**: 2026-02-02
