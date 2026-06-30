# Comparative Analysis of Machine Learning Models for Remote Sensing-Based Harmful Algal Bloom Detection Across Reservoirs in Taiwan

**Master's Thesis**

**Zalfa Afifah Zahra**

Department of Civil Engineering and Environmental Informatics  
Minghsin University of Science and Technology  
2026

---

# Abstract

Harmful algal blooms (HABs) have become a major environmental concern due to their impacts on freshwater ecosystems, drinking water quality, and public health. In Taiwan, reservoirs play a critical role in supplying domestic, agricultural, and industrial water, making efficient HAB monitoring essential. Conventional monitoring methods primarily rely on in-situ sampling, which provides accurate observations but is limited by sparse spatial coverage, high operational costs, and low sampling frequency.

This research presents a remote sensing-based framework for multi-reservoir HAB detection by integrating Sentinel-2 Level-2A imagery with in-situ chlorophyll-*a* measurements collected between 2019 and 2026. After temporal matching within a ±3-day window, a dataset consisting of 1,095 observations from 41 reservoirs and 95 monitoring stations was developed. Six Sentinel-2 spectral bands, four band-ratio variables, and six spectral indices were used as predictor variables for supervised machine learning classification.

Four machine learning algorithms: Random Forest (RF), Support Vector Machine (SVM), k-Nearest Neighbors (kNN), and Extreme Gradient Boosting (XGBoost) were evaluated under both original and SMOTE-balanced datasets. Experimental results demonstrated that XGBoost achieved the highest overall performance, with an accuracy of 85.84% and a macro F1-score of 0.7339. Feature importance analysis further identified the Normalized Difference Chlorophyll Index (NDCI), Chlorophyll Index (CI), and the B5/B4 ratio as the most influential predictors for chlorophyll-*a* classification.

The proposed framework demonstrates the potential of combining Sentinel-2 imagery and machine learning to support scalable reservoir-scale HAB monitoring and decision-making for freshwater management.

**Keywords:** Harmful Algal Bloom, Remote Sensing, Sentinel-2, Machine Learning, Water Quality, Taiwan

---

# Introduction

Harmful algal blooms have become increasingly frequent worldwide as a consequence of eutrophication, climate change, and increasing anthropogenic pressure on freshwater ecosystems. Cyanobacterial blooms can degrade water quality, threaten aquatic biodiversity, increase drinking water treatment costs, and pose serious risks to human health.

Although Taiwan operates regular reservoir water quality monitoring programmes, conventional in-situ measurements remain spatially sparse and cannot adequately capture the dynamic distribution of bloom events. Satellite remote sensing provides repeated observations over large spatial extents, while recent advances in machine learning enable the extraction of complex relationships between spectral information and water quality indicators.

Despite these advances, transferring machine learning models across multiple reservoirs remains challenging because reservoir morphology, optical water properties, watershed characteristics, and environmental conditions vary substantially throughout Taiwan. This study addresses this limitation through a comparative evaluation of several supervised machine learning algorithms for multi-reservoir HAB detection.

---

# Research Objectives

The objectives of this study are:

1. Develop an automated workflow for extracting Sentinel-2 spectral information using Google Earth Engine.

2. Integrate satellite observations with in-situ chlorophyll-*a* measurements through temporal matching.

3. Compare the performance of multiple machine learning algorithms for HAB classification.

4. Investigate the influence of class balancing using the Synthetic Minority Oversampling Technique (SMOTE).

5. Identify the most informative spectral variables for chlorophyll-*a* classification.

---

# Methodology

The overall research workflow consists of five stages.

```

In-situ Water Quality Data
│
├── Chlorophyll-a observations
│
▼
Sentinel-2 Level-2A Images
│
▼
Google Earth Engine Preprocessing
│
├── Cloud masking
├── Temporal matching (±3 days)
├── Spectral band extraction
└── Spectral index calculation
│
▼
Dataset Preparation
│
├── Feature engineering
├── Data cleaning
├── Train-test split
└── SMOTE
│
▼
Machine Learning
│
├── Random Forest
├── SVM
├── kNN
└── XGBoost
│
▼
Performance Evaluation

```

---

# Study Area

- **Country:** Taiwan
- **Reservoirs:** 41
- **Monitoring stations:** 95
- **Observation period:** 2019–2026
- **Matched observations:** 1,095

---

# Predictor Variables

### Sentinel-2 Spectral Bands

- B2 (Blue)
- B3 (Green)
- B4 (Red)
- B5 (Red Edge)
- B8 (Near Infrared)
- B11 (Shortwave Infrared)

### Spectral Indices

- NDVI
- NDWI
- NDRE
- NDCI
- Chlorophyll Index (CI)
- Floating Algae Index (FAI)

### Band Ratios

- B2/B3
- B3/B2
- B3/B4
- B5/B4

---

# Machine Learning Models

The following supervised learning algorithms were evaluated.

| Model | SMOTE | Hyperparameter Tuning |
|--------|:-----:|:---------------------:|
| Random Forest | ✓ | GridSearchCV |
| Support Vector Machine | ✓ | GridSearchCV |
| k-Nearest Neighbors | ✓ | GridSearchCV |
| XGBoost | ✓ | GridSearchCV |

---

# Results

## Overall Model Performance

Four supervised machine learning algorithms (Random Forest, Support Vector Machine, k-Nearest Neighbors, and XGBoost) were evaluated under both the original dataset and the SMOTE-balanced dataset.

| Model | SMOTE | Accuracy | Macro Precision | Macro Recall | Macro F1 | Weighted F1 |
|------|:------:|---------:|---------------:|-------------:|----------:|------------:|
| kNN | No | 81.74% | 0.8360 | 0.5524 | 0.5755 | 0.8040 |
| Random Forest | No | 82.65% | 0.6872 | 0.7188 | 0.6976 | 0.8234 |
| SVM | No | 81.74% | 0.6581 | 0.7494 | 0.6840 | 0.8193 |
| **XGBoost** | **No** | **85.84%** | **0.8091** | **0.6930** | **0.7339** | **0.8543** |
| kNN | Yes | 79.45% | 0.6398 | 0.7206 | 0.6703 | 0.8033 |
| Random Forest | Yes | 81.28% | 0.6470 | 0.6775 | 0.6584 | 0.8122 |
| SVM | Yes | 84.47% | 0.7085 | 0.7788 | 0.7331 | 0.8455 |
| XGBoost | Yes | 82.19% | 0.6855 | 0.7865 | 0.7168 | 0.8214 |

Among all evaluated models, **XGBoost without SMOTE achieved the best overall performance**, obtaining an **accuracy of 85.84%**, **macro F1-score of 0.7339**, and **weighted F1-score of 0.8543**. The results demonstrate that XGBoost provided the strongest balance between overall classification accuracy and class-wise predictive performance. In contrast, applying SMOTE generally improved minority-class recall, particularly for SVM and XGBoost, but introduced a trade-off by reducing overall accuracy and weighted F1-score.

---

## Feature Importance

Feature importance analysis revealed that **red-edge spectral information** played the most important role in chlorophyll-*a* classification.

| Rank | RF (No SMOTE) | RF (SMOTE) | XGBoost (No SMOTE) | XGBoost (SMOTE) |
|-----|----------------|----------------|----------------|----------------|
| 1 | NDCI (0.1711) | CI (0.1591) | NDCI (0.2685) | B5/B4 (0.3247) |
| 2 | CI (0.1571) | NDCI (0.1547) | B5/B4 (0.1777) | B3/B2 (0.0677) |
| 3 | B5/B4 (0.1380) | B5/B4 (0.1459) | B2/B3 (0.0860) | B2 (0.0670) |
| 4 | B2/B3 (0.0666) | B3/B2 (0.0628) | NDRE (0.0566) | NDRE (0.0664) |
| 5 | B3/B2 (0.0593) | B3/B4 (0.0578) | B3/B4 (0.0496) | B2/B3 (0.0661) |

NDCI consistently ranked among the most influential variables across all model configurations, while the B5/B4 ratio became the dominant predictor after SMOTE balancing. These findings highlight the importance of Sentinel-2 red-edge information for chlorophyll-*a* estimation and HAB detection.

---

## ROC-AUC Performance

| Model | SMOTE | Macro ROC-AUC |
|------|:------:|--------------:|
| kNN | No | 0.842 |
| Random Forest | No | 0.925 |
| SVM | No | 0.921 |
| **XGBoost** | **No** | **0.930** |
| kNN | Yes | 0.859 |
| Random Forest | Yes | 0.920 |
| SVM | Yes | 0.910 |
| XGBoost | Yes | 0.923 |

XGBoost achieved the highest macro ROC-AUC under both original and balanced training conditions, confirming its superior ability to discriminate between chlorophyll-*a* classes. Random Forest and SVM also demonstrated excellent discriminative performance (Macro ROC-AUC > 0.90), whereas kNN showed comparatively weaker class separability.

---

## Key Findings

- Developed a matched dataset containing **1,095 observations** from **41 reservoirs** and **95 monitoring stations** across Taiwan.
- **XGBoost without SMOTE** achieved the highest overall performance (**Accuracy = 85.84%, Macro F1 = 0.7339, Macro ROC-AUC = 0.9300**).
- SMOTE substantially improved minority-class detection, particularly for SVM and XGBoost, although overall accuracy slightly decreased.
- **NDCI**, **CI**, and the **B5/B4 ratio** were identified as the most informative Sentinel-2 features for chlorophyll-*a* classification.
- The proposed framework demonstrates that integrating **Sentinel-2 imagery** with **machine learning** provides an effective and scalable approach for multi-reservoir harmful algal bloom monitoring across Taiwan.

---

# Repository Structure

```
│
├── data/
│   ├── sample_data.csv
│   └── final_data.csv
│
├── gee/
│   ├── 01_sample_station_features
│   └── 02_export_high_low_hab_geotiff
│
├── notebooks/
│   ├── 01_sentinel2_feature_extraction.ipynb
│   ├── 02_in_situ_data_preparation.ipynb
│   ├── 03_dataset_preparation.ipynb
│   ├── 04_machine_learning_models.ipynb
│   └── 05_results_visualization.ipynb
│
├── models/
│   ├── kNN.pkl
│   ├── kNN_SMOTE.pkl
│   ├── Random_Forest.pkl
│   ├── Random_Forest_SMOTE.pkl
│   ├── SVM.pkl
│   ├── SVM_SMOTE.pkl
│   ├── XGBoost.pkl
│   └── XGBoost_SMOTE.pkl
│
├── models/
│   └── zahra_thesis.pdf
│
└── README.md
```

---

# Future Work

Potential future developments include

- Physics-informed machine learning
- Transformer-based geospatial foundation models
- Multi-sensor satellite fusion
- Spatial cross-validation
- Near real-time HAB monitoring systems

---

# Citation

If you use this repository, please cite:

```bibtex
@mastersthesis{zahra2026,
  author = {Zalfa Afifah Zahra},
  title = {Comparative Analysis of Machine Learning Models for Remote Sensing-Based Harmful Algal Bloom Detection Across Reservoirs in Taiwan},
  school = {Minghsin University of Science and Technology},
  year = {2026}
}
```

---

# License

MIT License
