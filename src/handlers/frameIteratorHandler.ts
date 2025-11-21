// src/handlers/frameIteratorHandler.ts

import { FrameIteratorUtils } from '../utils/frameIteratorUtils';

export class FrameIteratorHandler {

  static async handleShuffleElements() {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== "FRAME") {
      figma.notify("❌ Please select a frame to shuffle elements!");
      return;
    }

    const originalFrame = selection[0] as FrameNode;
    const children = [...originalFrame.children].filter(child => !child.locked);

    if (children.length < 2) {
      figma.notify("⚠️ Need at least 2 unlocked elements to shuffle!");
      return;
    }

    figma.notify("🔄 Shuffling elements...");

    // Collect original transforms
    const originalTransforms = children.map(child => ({
      x: child.x,
      y: child.y,
      width: child.width,
      height: child.height
    }));

    // Shuffle positions/sizes
    const shuffledTransforms = FrameIteratorUtils.shuffleArray(originalTransforms);

    // Duplicate frame
    const newFrame = originalFrame.clone();
    newFrame.x = originalFrame.x + originalFrame.width + 50;
    newFrame.y = originalFrame.y;
    newFrame.name = `${originalFrame.name} - Shuffled`;

    // Apply new transforms
    let transformIndex = 0;
    for (const child of newFrame.children) {
      if (!child.locked) {
        const transform = shuffledTransforms[transformIndex];
        const originalSize = { width: child.width, height: child.height };
        const newSize = { width: transform.width, height: transform.height };

        child.x = transform.x;
        child.y = transform.y;
        
        // Resize and adjust text if necessary
        if ('resize' in child) {
          child.resize(transform.width, transform.height);
          if (originalSize.width !== newSize.width || originalSize.height !== newSize.height) {
             await FrameIteratorUtils.adjustTextStyles(child, originalSize, newSize);
          }
        }
        transformIndex++;
      }
    }

    figma.currentPage.selection = [newFrame];
    figma.viewport.scrollAndZoomIntoView([newFrame]);
    figma.notify("✅ Elements shuffled!");
  }

  static async handleGenerateSpotlight() {
    const selection = figma.currentPage.selection;

    if (selection.length === 0 || selection[0].type !== "FRAME") {
      figma.notify("❌ Please select a frame!");
      return;
    }

    const originalFrame = selection[0] as FrameNode;
    const allChildren = [...originalFrame.children];
    const unlockedChildren = allChildren.filter(child => !child.locked);

    if (unlockedChildren.length < 1) {
      figma.notify("⚠️ No unlocked elements found.");
      return;
    }

    // Detect the "throne" (current main element)
    const currentMainElement = FrameIteratorUtils.detectMainGroup(unlockedChildren);
    if (!currentMainElement) {
      figma.notify("❌ Could not detect main element.");
      return;
    }

    const mainTransform = {
      x: currentMainElement.x, y: currentMainElement.y,
      width: currentMainElement.width, height: currentMainElement.height
    };

    figma.notify(`👑 Generating spotlight variations based on "${currentMainElement.name}"...`);

    const newFrames: SceneNode[] = [];

    // Create a variation for each element
    for (let i = 0; i < unlockedChildren.length; i++) {
      const elementToPromote = unlockedChildren[i];
      
      // Skip if already the main element (optional, but saves time)
      if (elementToPromote.id === currentMainElement.id) continue;

      const newFrame = originalFrame.clone();
      newFrame.x = originalFrame.x + (originalFrame.width + 100) * (newFrames.length + 1);
      newFrame.y = originalFrame.y;
      newFrame.name = FrameIteratorUtils.incrementFrameVersion(originalFrame.name, i + 1) + ` (${elementToPromote.name})`;

      const newUnlocked = newFrame.children.filter(c => !c.locked);
      const newPromoted = newUnlocked[i];
      
      // Find who's in the main spot in the new frame
      const currentInSpot = newUnlocked.find(c => 
        Math.abs(c.x - mainTransform.x) < 1 && Math.abs(c.y - mainTransform.y) < 1
      );

      if (currentInSpot && currentInSpot !== newPromoted) {
         // Swap
         const oldPromotedTransform = { x: newPromoted.x, y: newPromoted.y, width: newPromoted.width, height: newPromoted.height };
         
         // Promoted goes to throne
         newPromoted.x = mainTransform.x;
         newPromoted.y = mainTransform.y;
         if ('resize' in newPromoted) {
           newPromoted.resize(mainTransform.width, mainTransform.height);
           await FrameIteratorUtils.adjustTextStyles(newPromoted, oldPromotedTransform, mainTransform);
         }

         // Old king goes to promoted's place
         currentInSpot.x = oldPromotedTransform.x;
         currentInSpot.y = oldPromotedTransform.y;
         if ('resize' in currentInSpot) {
           currentInSpot.resize(oldPromotedTransform.width, oldPromotedTransform.height);
           await FrameIteratorUtils.adjustTextStyles(currentInSpot, mainTransform, oldPromotedTransform);
         }
      }

      newFrames.push(newFrame);
    }

    figma.currentPage.selection = newFrames;
    figma.viewport.scrollAndZoomIntoView(newFrames);
    figma.notify(`✅ Generated ${newFrames.length} spotlight variations!`);
  }
}
