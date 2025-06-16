/**
 * Main entry point for the Pokemon Word Chain Helper application
 * Uses the new MVC architecture with AppController
 */
import { createAppController } from './controllers/appController.js';

/**
 * Initialize and start the application
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Create and initialize the main application controller
    const appController = createAppController();
    await appController.initialize();

    console.log('Pokemon Word Chain Helper initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);

    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        flex-direction: column;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <h1 style="color: #e74c3c;">アプリケーションの初期化に失敗しました</h1>
        <p style="color: #7f8c8d; margin-bottom: 20px;">
          ページを再読み込みしてもう一度お試しください。
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3498db;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          再読み込み
        </button>
      </div>
    `;
  }
});
