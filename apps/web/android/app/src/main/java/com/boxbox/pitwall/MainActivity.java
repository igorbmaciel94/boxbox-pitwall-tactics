package com.boxbox.pitwall;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (view, insets) -> {
            int top = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top;
            float density = getResources().getDisplayMetrics().density;
            int topDp = Math.round(top / density);

            WebView webView = getBridge().getWebView();
            webView.evaluateJavascript(
                "document.documentElement.style.setProperty('--status-bar-height', '" + topDp + "px')",
                null
            );

            return ViewCompat.onApplyWindowInsets(view, insets);
        });
    }
}
