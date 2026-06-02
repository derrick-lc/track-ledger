import UIKit
import WebKit

final class ViewController: UIViewController, WKNavigationDelegate {
  private var webView: WKWebView!

  override func loadView() {
    let configuration = WKWebViewConfiguration()
    configuration.defaultWebpagePreferences.allowsContentJavaScript = true

    webView = WKWebView(frame: .zero, configuration: configuration)
    webView.navigationDelegate = self
    webView.isOpaque = false
    webView.backgroundColor = UIColor(red: 0.973, green: 0.980, blue: 0.984, alpha: 1)
    webView.scrollView.backgroundColor = webView.backgroundColor
    webView.scrollView.contentInsetAdjustmentBehavior = .never
    view = webView
  }

  override func viewDidLoad() {
    super.viewDidLoad()

    guard let url = Bundle.main.url(forResource: "index", withExtension: "html") else {
      return
    }

    webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
  }
}
