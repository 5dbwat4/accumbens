import { countCategoryWeight, normalizeCategoryPath, sha256, sortByPath, toCategoryRef } from "./helpers.mjs";

const firstFitDecreasing = (segments, maxPerFile) => {
  const bins = [];
  const ordered = [...segments].sort((left, right) => {
    if (left.weight !== right.weight) return right.weight - left.weight;
    return sortByPath(left.id, right.id);
  });

  for (const segment of ordered) {
    let placed = false;
    for (const bin of bins) {
      if (bin.weight + segment.weight <= maxPerFile) {
        bin.segments.push(segment);
        bin.weight += segment.weight;
        placed = true;
        break;
      }
    }
    if (!placed) {
      bins.push({
        segments: [segment],
        weight: segment.weight,
      });
    }
  }

  return bins;
};

export const packSegmentsIntoFiles = ({ segments, maxPerFile, filePrefix }) => {
  const bins = firstFitDecreasing(segments, maxPerFile);
  const files = [];

  for (const bin of bins) {
    const key = bin.segments.map((item) => item.id).sort(sortByPath).join("|");
    const fileId = `${filePrefix}-${sha256(`${filePrefix}:${key}`).slice(0, 12)}`;
    files.push({
      id: fileId,
      weight: bin.weight,
      segments: bin.segments,
    });
  }

  return files.sort((left, right) => sortByPath(left.id, right.id));
};

export const buildEntrySegments = ({ bucketItems, maxEntriesPerChunk }) => {
  const categoryGroups = new Map();

  for (const item of bucketItems) {
    const categoryKey = normalizeCategoryPath(item.categoryPath || "");
    if (!categoryGroups.has(categoryKey)) {
      categoryGroups.set(categoryKey, []);
    }
    categoryGroups.get(categoryKey).push(item);
  }

  const orderedCategoryKeys = [...categoryGroups.keys()].sort((left, right) => {
    const leftDepth = left ? left.split("/").length : 0;
    const rightDepth = right ? right.split("/").length : 0;
    if (leftDepth !== rightDepth) return rightDepth - leftDepth;
    return sortByPath(left, right);
  });

  const segments = [];
  for (const categoryKey of orderedCategoryKeys) {
    const groupItems = categoryGroups
      .get(categoryKey)
      .slice()
      .sort((left, right) => sortByPath(left.relPath, right.relPath));

    for (let cursor = 0; cursor < groupItems.length; cursor += maxEntriesPerChunk) {
      const partIndex = Math.floor(cursor / maxEntriesPerChunk);
      const chunkItems = groupItems.slice(cursor, cursor + maxEntriesPerChunk);
      const segmentId = `entry-seg-${sha256(`${categoryKey}|${partIndex}|${chunkItems[0]?.unikey || "none"}`).slice(0, 16)}`;
      segments.push({
        id: segmentId,
        weight: chunkItems.length,
        entries: chunkItems,
      });
    }
  }

  return segments;
};

const chunkizeCategory = ({ category, maxChunkWeight, chunkStore }) => {
  const ownEntries = Array.isArray(category.entries) ? category.entries : [];
  const subcategories = Array.isArray(category.subcategories) ? category.subcategories : [];
  const fullWeight = countCategoryWeight(category);

  const chunkId = `cfg-${sha256(`cfg:${category.path}:${category.name}:${fullWeight}`).slice(0, 16)}`;

  if (fullWeight <= maxChunkWeight || subcategories.length === 0) {
    chunkStore.set(chunkId, {
      id: chunkId,
      weight: Math.max(1, fullWeight),
      data: category,
    });
    return {
      id: chunkId,
      ref: toCategoryRef(category, chunkId),
    };
  }

  const nextSubcategories = [];
  for (const subcategory of subcategories) {
    const child = chunkizeCategory({
      category: subcategory,
      maxChunkWeight,
      chunkStore,
    });
    nextSubcategories.push(child.ref);
  }

  const parentChunkData = {
    ...category,
    subcategories: nextSubcategories,
    leaf: nextSubcategories.length === 0,
  };

  const parentWeight = Math.max(1, ownEntries.length + nextSubcategories.length);
  chunkStore.set(chunkId, {
    id: chunkId,
    weight: parentWeight,
    data: parentChunkData,
  });

  return {
    id: chunkId,
    ref: toCategoryRef(parentChunkData, chunkId),
  };
};

export const buildConfigChunks = ({ fullConfig, maxChunkWeight }) => {
  const chunkStore = new Map();

  const rootSubcategories = [];
  for (const subcategory of fullConfig.subcategories || []) {
    const chunkized = chunkizeCategory({
      category: subcategory,
      maxChunkWeight,
      chunkStore,
    });
    rootSubcategories.push(chunkized.ref);
  }

  const rootConfig = {
    ...fullConfig,
    subcategories: rootSubcategories,
  };

  return {
    rootConfig,
    chunkSegments: [...chunkStore.values()],
  };
};
