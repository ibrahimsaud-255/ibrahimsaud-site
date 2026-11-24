import AVFoundation
import UIKit

/// ماسح QR أصليّ بملء الشاشة: رمز الدخول على البطاقة (?c=&p=) وبطاقة الطالب للتحقّق (?v=).
/// زرّ إغلاق دائريّ، مصباح، إطار تصويب، اهتزاز عند النجاح — والمحاكي (بلا كاميرا) يطلب لصق الرمز نصّاً.
final class ScannerViewController: UIViewController, AVCaptureMetadataOutputObjectsDelegate {
    private let titleText: String
    private var done: ((String?) -> Void)?
    private let session = AVCaptureSession()
    private var preview: AVCaptureVideoPreviewLayer?
    private let frameView = UIView()
    private let torch = UIButton(type: .system)
    private let hint = UILabel()

    init(title: String, done: @escaping (String?) -> Void) {
        self.titleText = title
        self.done = done
        super.init(nibName: nil, bundle: nil)
        modalPresentationStyle = .fullScreen
    }
    required init?(coder: NSCoder) { fatalError() }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent }

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        view.semanticContentAttribute = .forceRightToLeft
        buildChrome()
        #if targetEnvironment(simulator)
        hint.text = "المحاكي بلا كاميرا — الصق الرمز"
        #else
        startCamera()
        #endif
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        #if targetEnvironment(simulator)
        askText()
        #endif
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        preview?.frame = view.bounds
    }

    // MARK: الواجهة
    private func buildChrome() {
        let close = UIButton(type: .system)
        var cfg = UIButton.Configuration.filled()
        cfg.image = UIImage(systemName: "xmark", withConfiguration: UIImage.SymbolConfiguration(pointSize: 15, weight: .bold))
        cfg.baseBackgroundColor = UIColor.white.withAlphaComponent(0.22)
        cfg.baseForegroundColor = .white
        cfg.cornerStyle = .capsule
        close.configuration = cfg
        close.accessibilityLabel = "إغلاق"
        close.addTarget(self, action: #selector(cancel), for: .touchUpInside)

        var tc = UIButton.Configuration.filled()
        tc.image = UIImage(systemName: "flashlight.off.fill", withConfiguration: UIImage.SymbolConfiguration(pointSize: 17, weight: .semibold))
        tc.baseBackgroundColor = UIColor.white.withAlphaComponent(0.22)
        tc.baseForegroundColor = .white
        tc.cornerStyle = .capsule
        torch.configuration = tc
        torch.accessibilityLabel = "المصباح"
        torch.addTarget(self, action: #selector(toggleTorch), for: .touchUpInside)

        let title = UILabel()
        title.text = titleText
        title.font = .preferredFont(forTextStyle: .title2).withWeight(.bold)
        title.adjustsFontForContentSizeCategory = true
        title.textColor = .white
        title.textAlignment = .center
        title.numberOfLines = 2

        hint.text = "وجّه الكاميرا نحو الرمز"
        hint.font = .preferredFont(forTextStyle: .subheadline)
        hint.adjustsFontForContentSizeCategory = true
        hint.textColor = UIColor.white.withAlphaComponent(0.85)
        hint.textAlignment = .center
        hint.numberOfLines = 2

        frameView.layer.borderColor = UIColor.white.cgColor
        frameView.layer.borderWidth = 3
        frameView.layer.cornerRadius = 28
        frameView.layer.cornerCurve = .continuous
        frameView.isUserInteractionEnabled = false

        for v in [close, torch, title, hint, frameView] as [UIView] { v.translatesAutoresizingMaskIntoConstraints = false; view.addSubview(v) }
        let g = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            close.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            close.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -16),
            close.widthAnchor.constraint(equalToConstant: 44), close.heightAnchor.constraint(equalToConstant: 44),
            torch.topAnchor.constraint(equalTo: g.topAnchor, constant: 12),
            torch.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 16),
            torch.widthAnchor.constraint(equalToConstant: 44), torch.heightAnchor.constraint(equalToConstant: 44),
            title.topAnchor.constraint(equalTo: close.bottomAnchor, constant: 18),
            title.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 24),
            title.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -24),
            frameView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            frameView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            frameView.widthAnchor.constraint(equalTo: view.widthAnchor, multiplier: 0.68),
            frameView.heightAnchor.constraint(equalTo: frameView.widthAnchor),
            hint.topAnchor.constraint(equalTo: frameView.bottomAnchor, constant: 22),
            hint.leadingAnchor.constraint(equalTo: g.leadingAnchor, constant: 24),
            hint.trailingAnchor.constraint(equalTo: g.trailingAnchor, constant: -24)
        ])
    }

    // MARK: الكاميرا
    private func startCamera() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized: configure()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { ok in DispatchQueue.main.async { ok ? self.configure() : self.denied() } }
        default: denied()
        }
    }

    private func denied() {
        hint.text = "الكاميرا ممنوعة — اسمح بها من الإعدادات، أو اكتب الرمز يدويّاً"
        torch.isHidden = true
        frameView.isHidden = true
        let open = UIButton(type: .system)
        var c = UIButton.Configuration.filled()
        c.title = "افتح الإعدادات"
        c.cornerStyle = .capsule
        c.baseBackgroundColor = .white
        c.baseForegroundColor = .black
        open.configuration = c
        open.addAction(UIAction { _ in
            if let u = URL(string: UIApplication.openSettingsURLString) { UIApplication.shared.open(u) }
        }, for: .touchUpInside)
        open.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(open)
        NSLayoutConstraint.activate([open.topAnchor.constraint(equalTo: hint.bottomAnchor, constant: 20), open.centerXAnchor.constraint(equalTo: view.centerXAnchor), open.heightAnchor.constraint(greaterThanOrEqualToConstant: 50)])
    }

    private func configure() {
        guard let device = AVCaptureDevice.default(for: .video), let input = try? AVCaptureDeviceInput(device: device), session.canAddInput(input) else { denied(); return }
        session.addInput(input)
        let out = AVCaptureMetadataOutput()
        guard session.canAddOutput(out) else { return }
        session.addOutput(out)
        out.setMetadataObjectsDelegate(self, queue: .main)
        out.metadataObjectTypes = [.qr]
        let layer = AVCaptureVideoPreviewLayer(session: session)
        layer.videoGravity = .resizeAspectFill
        layer.frame = view.bounds
        view.layer.insertSublayer(layer, at: 0)
        preview = layer
        torch.isHidden = !device.hasTorch
        DispatchQueue.global(qos: .userInitiated).async { self.session.startRunning() }
    }

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput objects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard let code = objects.compactMap({ $0 as? AVMetadataMachineReadableCodeObject }).first?.stringValue, !code.isEmpty else { return }
        finish(code)
    }

    @objc private func toggleTorch() {
        guard let d = AVCaptureDevice.default(for: .video), d.hasTorch, (try? d.lockForConfiguration()) != nil else { return }
        d.torchMode = d.torchMode == .on ? .off : .on
        d.unlockForConfiguration()
        var c = torch.configuration
        c?.image = UIImage(systemName: d.torchMode == .on ? "flashlight.on.fill" : "flashlight.off.fill")
        torch.configuration = c
    }

    @objc private func cancel() { finish(nil) }

    private func finish(_ value: String?) {
        guard let cb = done else { return }
        done = nil
        if session.isRunning { session.stopRunning() }
        dismiss(animated: true) { cb(value) }
    }

    #if targetEnvironment(simulator)
    private func askText() {
        let a = UIAlertController(title: titleText, message: "المحاكي بلا كاميرا: الصق نصّ الرمز (رابط البطاقة أو رقمها)", preferredStyle: .alert)
        a.addTextField { $0.textAlignment = .left; $0.keyboardType = .URL; $0.autocapitalizationType = .none }
        a.addAction(UIAlertAction(title: "إلغاء", style: .cancel) { _ in self.finish(nil) })
        a.addAction(UIAlertAction(title: "تمّ", style: .default) { _ in
            let t = a.textFields?.first?.text?.trimmingCharacters(in: .whitespaces) ?? ""
            self.finish(t.isEmpty ? nil : t)
        })
        present(a, animated: true)
    }
    #endif
}

private extension UIFont {
    func withWeight(_ w: UIFont.Weight) -> UIFont {
        let d = fontDescriptor.addingAttributes([.traits: [UIFontDescriptor.TraitKey.weight: w]])
        return UIFont(descriptor: d, size: 0)
    }
}
