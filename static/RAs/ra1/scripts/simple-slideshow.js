// Simple slideshow implementation
let currentSlide = 0;
let totalSlides = 63; // From header.json
let slidesData = null;

// Slide IDs from the header.json
const slideIds = [
  "754EBD94-49F3-4028-B98E-FFAD0C99AD36",
  "681610EA-88FA-4CFF-A745-DF0C3B9589EB",
  "36B9B74F-D17B-47AB-99CC-43F05A4F7266",
  "32F9C2B4-54C6-4BEB-94E0-B58D68C2C562",
  "62B739B6-0817-42C4-9A3A-C745737371FE",
  "2217419A-CB1C-4CC6-9FE6-4584A6ADA256",
  "22F1EB69-E296-40D8-98AF-D02F533D7F8F",
  "B20C4593-2EE3-48EF-8720-7166680ADC38",
  "9996E141-5019-4879-B64F-46A2F5A8021A",
  "DA9101EF-165A-4D77-B906-BFCFA65FC709",
  "DDDF96AD-0ABD-4795-96E6-531937585D12",
  "54B7D98A-4E5E-4D0A-ADE2-7A0455E1324D",
  "4D58865A-7D45-4A2E-B17E-F11427BE005B",
  "CEB9F7CE-3B46-4DD9-BB68-990C9275B595",
  "5C48E5AF-3190-4B6F-838F-ADE2B6636B0F",
  "0D55D247-0F8D-45AC-8159-50B764317B02",
  "41615C0E-122D-47E3-975A-D700AF0DEFB4",
  "E443DBB4-CA57-4D36-87E2-BB0DBBBED323",
  "2498EDED-EA59-4536-B5DB-C0F21858F6F9",
  "7EF2E15A-E108-4157-97FE-53115F2B7F6B",
  "9DAD64A7-CCF2-4130-BC26-1CFC43AEE514",
  "259FC390-E188-44ED-AC6D-CBBA92CB69AB",
  "06900BDB-E011-4829-AA69-9DF25F637AB5",
  "CF8DDA13-E97C-4C3E-9618-492E78E6E28F",
  "146C838C-FF15-4390-B07F-3E04904BDE24",
  "57FC9243-EA80-45EB-9536-C67AFD24C81B",
  "275121D0-BABE-43FA-8557-DFB197C99BC1",
  "B8E73BB7-2748-40F9-9735-3CE6834BCE39",
  "07A978A4-A520-4919-B10F-EB7517E7AACB",
  "93DB6C03-DE82-4CC3-B578-4A1E94227591",
  "9FF73C2C-3000-4D26-B9D7-3E8E30C83F2B",
  "33DCCD65-7621-4591-9BE6-8A4EF308033A",
  "E8F6DDF7-8C62-4448-80CA-F30754F28FA2",
  "C30614CE-8D10-47D2-9A18-D7A1F3798FDA",
  "D37EBED7-162F-463C-9563-A702EB59FFC6",
  "1DFB83F1-DEE3-4BAA-9FE6-83F2CA8B183B",
  "3AA5EAF3-3D3C-435B-B421-004C5B0C8F10",
  "45197B55-8B48-476D-9D30-50159FDF98F0",
  "8E16D7BE-ED52-4D02-9AE4-3A119A1F2FFF",
  "ACB4B81D-5516-4562-9D99-E4DD4DE5FE94",
  "D4B99155-C30E-4151-B6B0-B595094AA2D2",
  "FD57C914-6117-446C-902B-CBAB8DDCC1DB",
  "090FFC78-5481-4DED-B949-2606B757183C",
  "B2CFA0FB-0151-4311-85D1-40067CB6364D",
  "CEBA9A1A-C9A3-4CB2-8B3C-FB6F5F01DC8F",
  "306273CC-DC33-4F69-8011-27632EF9C1C9",
  "452171DD-7443-4D74-B86C-8740BBF6ADC5",
  "85B48307-670A-496C-959E-9C75B736BD07",
  "50F59452-174F-4883-BB1C-29EDC9357976",
  "17470F35-DC2B-440E-8E7F-86567A1DDF80",
  "94A85D23-5A70-4893-BD17-963D4F0E9795",
  "55D4BEED-5DCD-4DA9-B0FD-B9D9CEE0C031",
  "C301C2B6-86FB-4E9A-A65A-2379A11E87C3",
  "711EDFB8-22A0-42DE-98FF-BC9BF36EB862",
  "C23042FC-5C71-45C5-8454-EA3A4FF792E8",
  "5E8BA5B4-4E6E-4F44-88D3-A5E503D0E92F",
  "1A0E0D9A-D86C-472E-B716-629A9B15F3BB",
  "D8B5D1B2-FD55-4AAA-A6F4-C1BF40C18C1E",
  "64DA14DB-392A-4E26-97FF-4C4B810B6D03",
  "F1719223-D1A1-4D72-9025-ECB06AE890BB",
  "A650BC8C-839D-48B6-8388-C74464C289B4",
  "6607F37B-B43B-4CDB-A092-F4DB0B17BE98",
  "ED93A4F4-844D-4AA7-8D5C-C1F2F0FA1815"
];

function updateSlideInfo() {
  const slideInfo = document.getElementById('slide-info');
  const percentage = Math.round(((currentSlide + 1) / totalSlides) * 100);
  slideInfo.textContent = `${currentSlide + 1} / ${totalSlides} (${percentage}%)`;

  // Update button states
  document.getElementById('prev-btn').disabled = currentSlide === 0;
  document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

async function loadSlide(slideIndex) {
  if (slideIndex < 0 || slideIndex >= totalSlides) return;

  const slideId = slideIds[slideIndex];
  const slideImg = document.getElementById('current-slide-img');

  // Clear existing hyperlinks
  clearHyperlinks();

  // Use thumbnail images since PNG files are not available in RA1
  const thumbnailPath = `./RA1/assets/${slideId}/thumbnail.jpeg`;

  slideImg.onload = async () => {
    currentSlide = slideIndex;
    updateSlideInfo();

    // Load hyperlinks for this slide
    await loadHyperlinks(slideId);
  };

  slideImg.onerror = () => {
    console.error('Failed to load slide:', slideId);
  };

  slideImg.src = thumbnailPath;
}

function clearHyperlinks() {
  // Remove existing hyperlink overlays
  document.querySelectorAll('.slide-hyperlink').forEach(el => el.remove());
}

async function loadHyperlinks(slideId) {
  try {
    const response = await fetch(`./RA1/assets/${slideId}/${slideId}.json`);
    if (!response.ok) return;

    const slideData = await response.json();

    if (slideData.hyperlinks && slideData.hyperlinks.length > 0) {
      createHyperlinkOverlays(slideData.hyperlinks);
    }
  } catch (error) {
    console.log('No hyperlinks data for slide', slideId);
  }
}

function createHyperlinkOverlays(hyperlinks) {
  const slideContainer = document.querySelector('.slide-display');
  const slideImg = document.getElementById('current-slide-img');

  hyperlinks.forEach(hyperlink => {
    if (hyperlink.url) {
      const overlay = document.createElement('a');
      overlay.className = 'slide-hyperlink';
      overlay.href = hyperlink.url;
      overlay.target = '_blank';
      overlay.rel = 'noopener noreferrer';

      // Position the overlay based on the hyperlink coordinates
      // Note: These coordinates may need scaling based on actual image size vs original slide size
      const rect = hyperlink.targetRectangle;
      if (rect) {
        overlay.style.position = 'absolute';
        overlay.style.left = `${(rect.x / 720) * 100}%`; // Assuming original width of 720
        overlay.style.top = `${(rect.y / 405) * 100}%`; // Assuming original height of 405
        overlay.style.width = `${(rect.width / 720) * 100}%`;
        overlay.style.height = `${(rect.height / 405) * 100}%`;
        overlay.style.background = 'rgba(0, 123, 255, 0.2)';
        overlay.style.border = '2px solid rgba(0, 123, 255, 0.5)';
        overlay.style.cursor = 'pointer';
        overlay.style.zIndex = '10';

        // Add hover effect
        overlay.addEventListener('mouseenter', () => {
          overlay.style.background = 'rgba(0, 123, 255, 0.3)';
        });
        overlay.addEventListener('mouseleave', () => {
          overlay.style.background = 'rgba(0, 123, 255, 0.2)';
        });

        slideContainer.style.position = 'relative';
        slideContainer.appendChild(overlay);
      }
    }
  });
}

function changeSlide(direction) {
  const newSlide = currentSlide + direction;
  if (newSlide >= 0 && newSlide < totalSlides) {
    loadSlide(newSlide);
  }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      changeSlide(-1);
      break;
    case 'ArrowRight':
      changeSlide(1);
      break;
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('Simple slideshow loaded');
  updateSlideInfo();
});