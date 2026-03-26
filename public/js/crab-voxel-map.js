/**
 * Clawbster Mascot — Pixelbrick Renderer
 *
 * Generates the crab mascot as CSS pixel art with LEGO-stud brick texture.
 * Based on the official mascot pixel art (clawbster mascot.png).
 *
 * Usage:
 *   const container = document.getElementById('mascot');
 *   renderCrab(container, { pixelSize: 16, showStuds: true });
 */

// Color palette matching the mascot image
const CRAB_PALETTE = {
  'K': '#1D1D1D',   // black outline / eyes
  'R': '#B91C1C',   // dark red (claw darker areas)
  'r': '#DC2626',   // red (claw main)
  'D': '#7C2D12',   // dark brown (claw joint)
  'P': '#D94425',   // red-orange (claw→body transition)
  'T': '#E55A2B',   // tomato (upper body)
  'O': '#EA7B30',   // orange (body)
  'o': '#F4A261',   // light orange (mid body)
  'A': '#E8A030',   // amber (lower body)
  'G': '#E9C46A',   // gold (belly)
  'B': '#D4823A',   // brick orange (legs/feet)
};

// 17 columns x 16 rows — traced from mascot image
// Upper-left: claw (red pincer opening upward-left)
// Center-right: round body (red→orange→gold gradient)
// Two separate eyes (K pixels) in body at cols 8 & 12, rows 6-7
// Bottom: stubby legs + small right arm at rows 10-12
const CRAB_GRID = [
  //0    1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
  ['.', '.', '.', '.', '.', 'K', 'K', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],  // 0  tip of upper prong
  ['.', '.', '.', '.', 'K', 'r', 'r', 'K', '.', '.', '.', '.', '.', 'K', 'K', '.', '.'],  // 1  upper prong + body top outline
  ['.', '.', '.', 'K', 'r', 'r', 'R', 'D', '.', '.', '.', '.', 'K', 'T', 'O', 'K', '.'],  // 2  upper prong + body starts
  ['.', 'K', 'K', 'R', 'R', '.', '.', 'K', '.', '.', '.', 'K', 'P', 'O', 'O', 'O', 'K'],  // 3  lower prong gap + body
  ['.', 'K', 'R', 'R', '.', '.', 'K', '.', '.', '.', 'K', 'P', 'O', 'O', 'O', 'O', 'K'],  // 4  lower prong + body expands
  ['.', '.', 'K', 'K', 'K', 'K', 'r', 'P', 'T', 'T', 'O', 'O', 'O', 'O', 'O', 'O', 'K'],  // 5  claw base → body (smooth transition)
  ['.', '.', '.', '.', 'K', 'P', 'T', 'O', 'K', 'O', 'O', 'O', 'K', 'O', 'o', 'o', 'K'],  // 6  body, LEFT eye (col 8), RIGHT eye (col 12)
  ['.', '.', '.', '.', 'K', 'O', 'O', 'O', 'K', 'O', 'O', 'O', 'K', 'o', 'o', 'o', 'K'],  // 7  body, LEFT eye (col 8), RIGHT eye (col 12)
  ['.', '.', '.', '.', 'K', 'O', 'O', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'o', 'K', '.'],  // 8  body mid
  ['.', '.', '.', '.', '.', 'K', 'o', 'o', 'A', 'A', 'A', 'A', 'o', 'o', 'K', '.', '.'],  // 9  body lower
  ['.', '.', '.', '.', '.', 'K', 'A', 'A', 'G', 'G', 'G', 'G', 'A', 'K', 'K', 'K', '.'],  // 10 belly + right arm start
  ['.', '.', '.', '.', '.', 'K', 'G', 'G', 'G', 'G', 'G', 'G', 'K', '.', 'K', 'G', 'K'],  // 11 belly + right arm
  ['.', '.', '.', '.', '.', 'K', 'G', 'G', 'G', 'G', 'G', 'K', '.', '.', '.', 'K', 'K'],  // 12 belly bottom
  ['.', '.', '.', '.', '.', 'K', 'G', 'K', '.', '.', 'K', 'G', 'K', '.', '.', '.', '.'],  // 13 legs start
  ['.', '.', '.', '.', 'K', 'B', 'K', '.', '.', '.', '.', 'K', 'B', 'K', '.', '.', '.'],  // 14 legs
  ['.', '.', '.', '.', 'K', 'K', '.', '.', '.', '.', '.', 'K', 'K', '.', '.', '.', '.'],  // 15 feet
];

/**
 * Render the crab mascot into a container element.
 *
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options
 * @param {number} options.pixelSize - Size of each pixel/brick in px (default: 16)
 * @param {boolean} options.showStuds - Show LEGO-style studs on each brick (default: true)
 * @param {boolean} options.animate - Enable idle bob animation (default: true)
 * @param {string} options.className - Additional CSS class for the wrapper
 * @returns {HTMLElement|null} The wrapper element, or null if container is invalid
 */
function renderCrab(container, options = {}) {
  if (!container || !(container instanceof HTMLElement)) {
    console.error('renderCrab: container must be a valid DOM element, got:', container);
    return null;
  }

  const {
    pixelSize = 16,
    showStuds = true,
    animate = true,
    className = '',
  } = options;

  // Clear any previous render in this container
  container.innerHTML = '';

  const cols = CRAB_GRID[0].length;
  const rows = CRAB_GRID.length;

  // Inject styles if not already present
  if (!document.getElementById('crab-pixelbrick-styles')) {
    const style = document.createElement('style');
    style.id = 'crab-pixelbrick-styles';
    style.textContent = `
      .crab-pixelbrick-wrapper {
        display: inline-block;
        line-height: 0;
      }
      .crab-pixelbrick-wrapper.crab-animate {
        animation: crab-bob 3s ease-in-out infinite;
      }
      .crab-pixelbrick-grid {
        display: grid;
        line-height: 0;
        font-size: 0;
      }
      .crab-brick {
        position: relative;
        border-radius: 2px;
        box-shadow:
          inset 1px 1px 0 0 rgba(255,255,255,0.35),
          inset -1px -1px 0 0 rgba(0,0,0,0.25);
      }
      .crab-brick[data-type="K"] {
        box-shadow:
          inset 1px 1px 0 0 rgba(255,255,255,0.1),
          inset -1px -1px 0 0 rgba(0,0,0,0.3);
      }
      .crab-brick.has-stud::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 40%;
        height: 40%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255,255,255,0.15);
        box-shadow:
          0 1px 0 0 rgba(0,0,0,0.15),
          inset 0 -1px 0 0 rgba(255,255,255,0.1);
      }
      @keyframes crab-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .crab-pixelbrick-wrapper.crab-animate {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Build DOM
  const wrapper = document.createElement('div');
  wrapper.className = `crab-pixelbrick-wrapper ${animate ? 'crab-animate' : ''} ${className}`.trim();
  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', 'Clawbster mascot — a cute pixel art crab');

  const grid = document.createElement('div');
  grid.className = 'crab-pixelbrick-grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, ${pixelSize}px)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${pixelSize}px)`;
  grid.setAttribute('aria-hidden', 'true');

  const hideStuds = pixelSize < 10;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const code = CRAB_GRID[r][c];
      const color = CRAB_PALETTE[code];

      if (color) {
        const brick = document.createElement('div');
        brick.className = 'crab-brick' +
          (showStuds && !hideStuds ? ' has-stud' : '');
        brick.dataset.type = code;
        brick.style.gridColumn = c + 1;
        brick.style.gridRow = r + 1;
        brick.style.backgroundColor = color;
        brick.style.width = pixelSize + 'px';
        brick.style.height = pixelSize + 'px';
        grid.appendChild(brick);
      }
    }
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);

  return wrapper;
}

// Export for module usage, or attach to window for script-tag usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderCrab, CRAB_GRID, CRAB_PALETTE };
} else {
  window.renderCrab = renderCrab;
  window.CRAB_GRID = CRAB_GRID;
  window.CRAB_PALETTE = CRAB_PALETTE;
}
