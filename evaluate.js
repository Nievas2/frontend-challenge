#!/usr/bin/env node

/**
 * SWAG Frontend Challenge Auto-Evaluation Script
 * This script automatically evaluates candidate submissions based on the challenge requirements
 */

const fs = require('fs');
const path = require('path');

// Challenge scoring criteria based on README.md
const EVALUATION_CRITERIA = {
  bugs: {
    maxPoints: 40,
    pointsPerBug: 5,
    bugs: [
      {
        id: 'search-case-sensitive',
        name: 'Bug de Búsqueda: La búsqueda es case-sensitive',
        description: 'La búsqueda debe ser insensible a mayúsculas/minúsculas',
        check: (code) => {
          const productListCode = readFileContent('src/pages/ProductList.tsx');
          return productListCode && (
            productListCode.includes('.toLowerCase()') ||
            productListCode.includes('.toUpperCase()') ||
            productListCode.includes('RegExp') ||
            productListCode.includes('ignoreCase')
          );
        }
      },
      {
        id: 'price-sorting',
        name: 'Bug de Ordenamiento: Falta implementar ordenamiento por precio',
        description: 'El ordenamiento por precio no está implementado',
        check: (code) => {
          const productListCode = readFileContent('src/pages/ProductList.tsx');
          return productListCode && productListCode.includes('basePrice') && 
                 (productListCode.includes('sort') && productListCode.includes('price'));
        }
      },
      {
        id: 'pending-status',
        name: 'Bug de Estado: Productos "pending" se muestran como "disponibles"',
        description: 'Los productos con status "pending" deben manejarse correctamente',
        check: (code) => {
          const productCardCode = readFileContent('src/components/ProductCard.tsx');
          return productCardCode && (
            productCardCode.includes('pending') || 
            productCardCode.includes('status')
          );
        }
      },
      {
        id: 'stock-bug',
        name: 'Bug de Stock: Un producto aparece sin stock cuando debería tener 150 unidades',
        description: 'Revisar y corregir datos de stock en products.ts',
        check: (code) => {
          const productsData = readFileContent('src/data/products.ts');
          return productsData && productsData.includes('150') && 
                 checkStockConsistency();
        }
      },
      {
        id: 'missing-products',
        name: 'Bug de Datos: Faltan 14 productos para llegar al total prometido de 20',
        description: 'El array de productos debe tener exactamente 20 productos',
        check: (code) => {
          const productsData = readFileContent('src/data/products.ts');
          if (!productsData) return false;
          const productMatches = productsData.match(/{\s*id:\s*\d+,/g);
          return productMatches && productMatches.length >= 20;
        }
      },
      {
        id: 'discount-calculation',
        name: 'Bug de Cálculo: La calculadora no encuentra el mejor descuento por volumen',
        description: 'La lógica de cálculo de descuentos debe optimizarse',
        check: (code) => {
          const calculatorCode = readFileContent('src/components/PricingCalculator.tsx');
          return calculatorCode && calculatorCode.includes('calculatePrice') &&
                 (calculatorCode.includes('Math.max') || calculatorCode.includes('reverse') ||
                  calculatorCode.includes('findLast'));
        }
      },
      {
        id: 'price-format',
        name: 'Bug de Formato: Los precios no muestran formato chileno (CLP)',
        description: 'Los precios deben mostrarse en formato CLP chileno',
        check: (code) => {
          const calculatorCode = readFileContent('src/components/PricingCalculator.tsx');
          return calculatorCode && (
            calculatorCode.includes('CLP') ||
            calculatorCode.includes('es-CL') ||
            calculatorCode.includes('$') && calculatorCode.includes('toLocaleString')
          );
        }
      },
      {
        id: 'validation-max-quantity',
        name: 'Bug de Validación: No hay validación de cantidad máxima en inputs',
        description: 'Los inputs de cantidad deben tener validación de límites',
        check: (code) => {
          const calculatorCode = readFileContent('src/components/PricingCalculator.tsx');
          return calculatorCode && (
            calculatorCode.includes('max=') ||
            calculatorCode.includes('Math.min') ||
            calculatorCode.includes('maxLength')
          );
        }
      }
    ]
  },
  features: {
    maxPoints: 40,
    pointsPerFeature: 10,
    features: [
      {
        id: 'shopping-cart',
        name: 'Carrito de Compras',
        description: 'Agregar productos al carrito, contador en header, localStorage',
        check: (code) => {
          const hasCartContext = checkFileExists('src/contexts/CartContext.tsx') ||
                                 checkFileExists('src/context/CartContext.tsx') ||
                                 checkFileExists('src/hooks/useCart.tsx');
          const hasLocalStorage = code.includes('localStorage');
          const hasCartCounter = readFileContent('src/components/Header.tsx')?.includes('cart') || false;
          return hasCartContext && hasLocalStorage && hasCartCounter;
        }
      },
      {
        id: 'advanced-filters',
        name: 'Filtros Avanzados',
        description: 'Filtro por proveedor, rango de precios, limpiar filtros',
        check: (code) => {
          const filtersCode = readFileContent('src/components/ProductFilters.tsx');
          return filtersCode && (
            filtersCode.includes('supplier') &&
            filtersCode.includes('price') &&
            filtersCode.includes('clear')
          );
        }
      },
      {
        id: 'quote-simulator',
        name: 'Simulador de Cotización',
        description: 'Formulario con datos de empresa, cálculo de precio final, resumen exportable',
        check: (code) => {
          const hasQuoteForm = checkFileExists('src/components/QuoteForm.tsx') ||
                               checkFileExists('src/pages/Quote.tsx') ||
                               readFileContent('src/components/PricingCalculator.tsx')?.includes('empresa');
          const hasExport = code.includes('export') || code.includes('download') || code.includes('PDF');
          return hasQuoteForm && hasExport;
        }
      },
      {
        id: 'ux-improvements',
        name: 'Mejoras de UX',
        description: 'Loading states, animaciones suaves, mensajes de error user-friendly',
        check: (code) => {
          const hasLoading = code.includes('loading') || code.includes('Loading');
          const hasAnimations = code.includes('transition') || code.includes('animation');
          const hasErrorMessages = code.includes('error') && code.includes('message');
          return hasLoading && hasAnimations && hasErrorMessages;
        }
      }
    ]
  },
  creativity: {
    maxPoints: 20,
    description: 'Mejoras creativas y optimizaciones adicionales'
  }
};

// Helper functions
function readFileContent(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function checkFileExists(filePath) {
  try {
    return fs.existsSync(path.join(process.cwd(), filePath));
  } catch (error) {
    return false;
  }
}

function checkStockConsistency() {
  const productsData = readFileContent('src/data/products.ts');
  if (!productsData) return false;
  
  // Check if there's a product with 150 stock
  return productsData.includes('stock: 150');
}

function evaluateBugs() {
  const results = {
    passed: [],
    failed: [],
    score: 0
  };

  const allCode = [
    readFileContent('src/pages/ProductList.tsx'),
    readFileContent('src/components/ProductCard.tsx'),
    readFileContent('src/components/PricingCalculator.tsx'),
    readFileContent('src/data/products.ts'),
    readFileContent('src/components/ProductFilters.tsx')
  ].join('\n');

  EVALUATION_CRITERIA.bugs.bugs.forEach(bug => {
    try {
      const passed = bug.check(allCode);
      if (passed) {
        results.passed.push({
          id: bug.id,
          name: bug.name,
          points: EVALUATION_CRITERIA.bugs.pointsPerBug
        });
        results.score += EVALUATION_CRITERIA.bugs.pointsPerBug;
      } else {
        results.failed.push({
          id: bug.id,
          name: bug.name,
          description: bug.description,
          points: 0
        });
      }
    } catch (error) {
      results.failed.push({
        id: bug.id,
        name: bug.name,
        description: `Error evaluando: ${bug.description}`,
        points: 0
      });
    }
  });

  return results;
}

function evaluateFeatures() {
  const results = {
    passed: [],
    failed: [],
    score: 0
  };

  const allCode = [
    readFileContent('src/pages/ProductList.tsx'),
    readFileContent('src/components/ProductCard.tsx'),
    readFileContent('src/components/PricingCalculator.tsx'),
    readFileContent('src/components/ProductFilters.tsx'),
    readFileContent('src/components/Header.tsx'),
    readFileContent('src/App.tsx')
  ].join('\n');

  EVALUATION_CRITERIA.features.features.forEach(feature => {
    try {
      const passed = feature.check(allCode);
      if (passed) {
        results.passed.push({
          id: feature.id,
          name: feature.name,
          points: EVALUATION_CRITERIA.features.pointsPerFeature
        });
        results.score += EVALUATION_CRITERIA.features.pointsPerFeature;
      } else {
        results.failed.push({
          id: feature.id,
          name: feature.name,
          description: feature.description,
          points: 0
        });
      }
    } catch (error) {
      results.failed.push({
        id: feature.id,
        name: feature.name,
        description: `Error evaluando: ${feature.description}`,
        points: 0
      });
    }
  });

  return results;
}

function evaluateCreativity() {
  let creativityScore = 0;
  const bonusPoints = [];

  // Check for additional files and improvements
  const additionalFiles = [
    'src/contexts/',
    'src/hooks/',
    'src/utils/',
    'tests/',
    'cypress/',
    'README_SOLUTION.md'
  ];

  additionalFiles.forEach(dir => {
    if (checkFileExists(dir)) {
      creativityScore += 2;
      bonusPoints.push(`+2 puntos por crear ${dir}`);
    }
  });

  // Check for testing
  if (checkFileExists('src/__tests__') || readFileContent('package.json')?.includes('test')) {
    creativityScore += 5;
    bonusPoints.push('+5 puntos por implementar tests');
  }

  // Check for accessibility improvements
  const allCode = [
    readFileContent('src/components/ProductCard.tsx'),
    readFileContent('src/components/Header.tsx'),
    readFileContent('src/pages/ProductList.tsx')
  ].join('\n');

  if (allCode.includes('aria-') || allCode.includes('alt=') || allCode.includes('role=')) {
    creativityScore += 3;
    bonusPoints.push('+3 puntos por mejoras de accesibilidad');
  }

  // Check for performance optimizations
  if (allCode.includes('useMemo') || allCode.includes('useCallback') || allCode.includes('lazy')) {
    creativityScore += 3;
    bonusPoints.push('+3 puntos por optimizaciones de performance');
  }

  return {
    score: Math.min(creativityScore, EVALUATION_CRITERIA.creativity.maxPoints),
    bonusPoints,
    maxPoints: EVALUATION_CRITERIA.creativity.maxPoints
  };
}

function generateReport(bugResults, featureResults, creativityResults) {
  const totalScore = bugResults.score + featureResults.score + creativityResults.score;
  const maxScore = EVALUATION_CRITERIA.bugs.maxPoints + 
                   EVALUATION_CRITERIA.features.maxPoints + 
                   EVALUATION_CRITERIA.creativity.maxPoints;

  console.log('\n' + '='.repeat(60));
  console.log('🎯 SWAG FRONTEND CHALLENGE - EVALUACIÓN AUTOMÁTICA');
  console.log('='.repeat(60));
  
  console.log(`\n📊 PUNTAJE FINAL: ${totalScore}/${maxScore} puntos`);
  
  const percentage = Math.round((totalScore / maxScore) * 100);
  console.log(`📈 Porcentaje: ${percentage}%`);
  
  if (percentage >= 90) {
    console.log('🏆 ¡EXCEPCIONAL! Excelente trabajo');
  } else if (percentage >= 70) {
    console.log('🎉 ¡MUY BUENO! Buen nivel técnico');
  } else if (percentage >= 50) {
    console.log('👍 BUENO: Nivel aceptable con oportunidades de mejora');
  } else {
    console.log('📚 NECESITA MEJORA: Revisar los puntos pendientes');
  }

  // Bug fixes results
  console.log(`\n🐛 BUGS CORREGIDOS: ${bugResults.score}/${EVALUATION_CRITERIA.bugs.maxPoints} puntos`);
  console.log('✅ Bugs resueltos:');
  bugResults.passed.forEach(bug => {
    console.log(`   • ${bug.name} (+${bug.points} puntos)`);
  });
  
  if (bugResults.failed.length > 0) {
    console.log('❌ Bugs pendientes:');
    bugResults.failed.forEach(bug => {
      console.log(`   • ${bug.name}: ${bug.description}`);
    });
  }

  // Features results
  console.log(`\n🛠️  FUNCIONALIDADES: ${featureResults.score}/${EVALUATION_CRITERIA.features.maxPoints} puntos`);
  console.log('✅ Funcionalidades implementadas:');
  featureResults.passed.forEach(feature => {
    console.log(`   • ${feature.name} (+${feature.points} puntos)`);
  });
  
  if (featureResults.failed.length > 0) {
    console.log('❌ Funcionalidades pendientes:');
    featureResults.failed.forEach(feature => {
      console.log(`   • ${feature.name}: ${feature.description}`);
    });
  }

  // Creativity results
  console.log(`\n🎨 CREATIVIDAD Y MEJORAS: ${creativityResults.score}/${creativityResults.maxPoints} puntos`);
  if (creativityResults.bonusPoints.length > 0) {
    console.log('✨ Puntos bonus obtenidos:');
    creativityResults.bonusPoints.forEach(bonus => {
      console.log(`   • ${bonus}`);
    });
  } else {
    console.log('💡 Oportunidades de mejora:');
    console.log('   • Agregar tests unitarios (+5 puntos)');
    console.log('   • Implementar mejoras de accesibilidad (+3 puntos)');
    console.log('   • Agregar optimizaciones de performance (+3 puntos)');
    console.log('   • Crear hooks personalizados (+2 puntos)');
  }

  console.log('\n💡 FEEDBACK PARA TU CRECIMIENTO:');
  if (percentage >= 80) {
    console.log('Excelente nivel técnico. Mostraste dominio de React, TypeScript y buenas prácticas.');
  } else if (percentage >= 60) {
    console.log('Buen nivel base, pero hay áreas de mejora:');
    if (bugResults.failed.length > 0) {
      console.log('• Completar más bugs críticos del challenge');
    }
    if (featureResults.failed.length > 0) {
      console.log('• Implementar funcionalidades adicionales');
    }
    console.log('• Mejorar la calidad y estructura del código');
    if (creativityResults.score < 5) {
      console.log('• Agregar testing y optimizaciones de performance');
    }
  } else {
    console.log('Hay potencial, pero necesitas trabajar en:');
    console.log('• Completar los bugs críticos identificados');
    console.log('• Implementar las funcionalidades core del challenge');
    console.log('• Mejorar las habilidades de debugging y problem solving');
    console.log('• Profundizar en React hooks y manejo de estado');
  }

  console.log('\n📚 RECURSOS RECOMENDADOS:');
  console.log('• React Documentation: https://react.dev');
  console.log('• TypeScript Handbook: https://www.typescriptlang.org/docs/');
  console.log('• Testing Library: https://testing-library.com/');
  
  console.log('\n' + '='.repeat(60));
  console.log('Evaluación completada. ¡Gracias por participar! 🚀');
  console.log('='.repeat(60));

  return {
    totalScore,
    maxScore,
    percentage,
    breakdown: {
      bugs: bugResults,
      features: featureResults,
      creativity: creativityResults
    }
  };
}

// Main evaluation function
function main() {
  console.log('🔍 Iniciando evaluación automática del SWAG Frontend Challenge...\n');
  
  // Check if we're in the right directory
  if (!checkFileExists('package.json') || !checkFileExists('src/')) {
    console.error('❌ Error: Este script debe ejecutarse desde la raíz del proyecto frontend-challenge');
    process.exit(1);
  }

  console.log('📁 Verificando estructura del proyecto...');
  console.log('📋 Evaluando bugs corregidos...');
  const bugResults = evaluateBugs();
  
  console.log('🛠️  Evaluando funcionalidades implementadas...');
  const featureResults = evaluateFeatures();
  
  console.log('🎨 Evaluando creatividad y mejoras...');
  const creativityResults = evaluateCreativity();
  
  console.log('📊 Generando reporte final...');
  const finalReport = generateReport(bugResults, featureResults, creativityResults);
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    ...finalReport
  };
  
  fs.writeFileSync('evaluation-report.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Reporte guardado en: evaluation-report.json');
}

// Run the evaluation
if (require.main === module) {
  main();
}

module.exports = { evaluateBugs, evaluateFeatures, evaluateCreativity, generateReport };