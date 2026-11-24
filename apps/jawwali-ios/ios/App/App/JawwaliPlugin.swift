import Capacitor
import Security
import UIKit
import WebKit

/// تطبيق «نظام الجمعيات الشبابية» — الميزات الأصليّة التي تناديها الصفحة (web/native.js ← window.JW_NATIVE):
/// info · scan (ماسح QR) · store/load (الجلسة في سلسلة المفاتيح) · haptic
@objc(JawwaliPlugin)
public class JawwaliPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "JawwaliPlugin"
    public let jsName = "Jawwali"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "info", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "scan", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "store", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "load", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "haptic", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "external", returnType: CAPPluginReturnPromise)
    ]

    private let service = "com.ibrahimsaud.jawwali.session"

    /// بيئة APNs (sandbox لنسخ Xcode، production لـTestFlight والمتجر) وخادم البيانات (JWServer في Info.plist).
    @objc func info(_ call: CAPPluginCall) {
        #if DEBUG
        let env = "sandbox"
        #else
        let env = "production"
        #endif
        let server = Bundle.main.object(forInfoDictionaryKey: "JWServer") as? String ?? "production"
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
        call.resolve(["apnsEnv": env, "staging": server == "staging", "version": version])
    }

    @objc func scan(_ call: CAPPluginCall) {
        let title = call.getString("title") ?? "امسح الرمز"
        DispatchQueue.main.async {
            guard let host = self.bridge?.viewController else { call.reject("لا واجهة"); return }
            let scanner = ScannerViewController(title: title) { value in
                if let value = value { call.resolve(["value": value]) } else { call.reject("cancel", "CANCELLED") }
            }
            host.present(scanner, animated: true)
        }
    }

    @objc func store(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else { call.reject("key"); return }
        let base: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                   kSecAttrService as String: service,
                                   kSecAttrAccount as String: key]
        SecItemDelete(base as CFDictionary)
        if let value = call.getString("value") {
            var add = base
            add[kSecValueData as String] = Data(value.utf8)
            add[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            let st = SecItemAdd(add as CFDictionary, nil)
            if st != errSecSuccess { call.reject("keychain \(st)"); return }
        }
        call.resolve()
    }

    @objc func load(_ call: CAPPluginCall) {
        let keys = call.getArray("keys", String.self) ?? []
        var values: [String: Any] = [:]
        for key in keys {
            let q: [String: Any] = [kSecClass as String: kSecClassGenericPassword,
                                    kSecAttrService as String: service,
                                    kSecAttrAccount as String: key,
                                    kSecReturnData as String: true,
                                    kSecMatchLimit as String: kSecMatchLimitOne]
            var out: AnyObject?
            if SecItemCopyMatching(q as CFDictionary, &out) == errSecSuccess, let d = out as? Data, let s = String(data: d, encoding: .utf8) {
                values[key] = s
            }
        }
        call.resolve(["values": values])
    }

    /// يفتح رابطاً في سفاري (ألعاب القاعة للبروجكتر مثلاً) بدل التنقّل داخل التطبيق
    @objc func external(_ call: CAPPluginCall) {
        guard let s = call.getString("url"), let u = URL(string: s), u.scheme == "https" else { call.reject("url"); return }
        DispatchQueue.main.async { UIApplication.shared.open(u); call.resolve() }
    }

    @objc func haptic(_ call: CAPPluginCall) {
        let kind = call.getString("kind") ?? "light"
        DispatchQueue.main.async {
            switch kind {
            case "success": UINotificationFeedbackGenerator().notificationOccurred(.success)
            case "error": UINotificationFeedbackGenerator().notificationOccurred(.error)
            default: UIImpactFeedbackGenerator(style: .light).impactOccurred()
            }
        }
        call.resolve()
    }
}

/// المتحكّم الرئيس: جسر Capacitor + تسجيل الإضافة الأصليّة قبل تحميل الصفحة.
class JawwaliViewController: CAPBridgeViewController {
    private var demoBackScript: WKUserScript?
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(JawwaliPlugin())
    }

    /// ملصقات Memoji وGenmoji من لوحة الإيموجي تُدرَج في حقل ‎#mjbox (contenteditable) — محرّر الشخصيّة يلتقطها صورةً
    override open func webViewConfiguration(for instanceConfiguration: InstanceConfiguration) -> WKWebViewConfiguration {
        let c = super.webViewConfiguration(for: instanceConfiguration)
        if #available(iOS 18.0, *) { c.supportsAdaptiveImageGlyph = true }
        // وضع التجربة للإدارة (النظام الكامل من الموقع ?demo=1): زرّ عائم للعودة إلى اختيار الدور في التطبيق
        let back = """
        (function(){ if (location.hostname.indexOf('ibrahimsaud.com') < 0 || new URLSearchParams(location.search).get('demo') !== '1') return;
          var a = document.createElement('a'); a.href = 'jawwali://localhost/season/index.html?demo=pick'; a.textContent = '‹ تجربة: بدّل الدور';
          a.style.cssText = 'position:fixed;top:calc(env(safe-area-inset-top) + 6px);left:50%;transform:translateX(-50%);z-index:2147483647;padding:9px 16px;border-radius:99px;background:rgba(255,255,255,.95);color:#111;font:800 14px/1.3 -apple-system,system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.3)';
          document.body.appendChild(a); })();
        """
        demoBackScript = WKUserScript(source: back, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        return c
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(red: 11 / 255, green: 11 / 255, blue: 20 / 255, alpha: 1)
        webView?.isOpaque = false
        webView?.backgroundColor = view.backgroundColor
        webView?.scrollView.backgroundColor = view.backgroundColor
        if let sc = demoBackScript { webView?.configuration.userContentController.addUserScript(sc) }
        // تطبيق لا متصفّح: لا تكبير بإصبعين ولا بالنقر المزدوج ولا عند لمس حقل نصّ (iOS يكبّر تلقائيّاً إن كان الخطّ < ١٦)
        webView?.configuration.userContentController.addUserScript(WKUserScript(source: Self.noZoom, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        webView?.scrollView.minimumZoomScale = 1
        webView?.scrollView.maximumZoomScale = 1
        webView?.scrollView.bouncesZoom = false
    }

    private static let noZoom = """
    (function(){
      var c = 'width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no,viewport-fit=cover';
      var m = document.querySelector('meta[name=viewport]');
      if (!m) { m = document.createElement('meta'); m.name = 'viewport'; (document.head || document.documentElement).appendChild(m); }
      m.setAttribute('content', c);
      var s = document.createElement('style');
      s.textContent = 'html{-webkit-text-size-adjust:100%;touch-action:manipulation}a,button,img{-webkit-touch-callout:none}';
      (document.head || document.documentElement).appendChild(s);
      document.addEventListener('gesturestart', function(e){ e.preventDefault(); }, { passive: false });
      document.addEventListener('dblclick', function(e){ e.preventDefault(); }, { passive: false });
    })();
    """
}
