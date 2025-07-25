const { chromium } = require('playwright');

class Streamer {
  constructor(io) {
    this.io = io;
    this.page = null;
    this.interval = null;
  }

  async start() {
    // Ejecutar el navegador en modo headless para evitar que se abra una ventana
    const context = await chromium.launchPersistentContext('./profile', {
      headless: true
    });
    const pages = context.pages();
    this.page = pages.length > 0 ? pages[0] : await context.newPage();
    this.interval = setInterval(async () => {
      if (!this.page) return;
      try {
        const buffer = await this.page.screenshot();
        this.io.emit('screenshot', 'data:image/png;base64,' + buffer.toString('base64'));
      } catch (err) {
        console.error('Screenshot error', err);
      }
    }, 500);
  }

  async executeStep(step) {
    if (!this.page) return;
    if (
      step.action === 'navigate' ||
      step.type === 'navigate' ||
      step.action === 'goto' ||
      step.type === 'goto'
    ) {
      await this.page.goto(step.url || step.action.url);
    } else if (step.action === 'click' || step.type === 'click') {
      await this.page.click(step.selector || step.action.selector);
    } else if (step.action === 'fill' || step.type === 'fill') {
      await this.page.fill(step.selector || step.action.selector, step.value || step.action.value);
    } else if (step.action === 'screenshot' || step.type === 'screenshot') {
      const buf = await this.page.screenshot({ fullPage: true });
      this.io.emit('chat-message', { sender: 'agent', screenshot: 'data:image/png;base64,' + buf.toString('base64') });
    }
  }
}

module.exports = Streamer;
