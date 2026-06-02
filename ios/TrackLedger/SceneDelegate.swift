import UIKit

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    let window = UIWindow(windowScene: windowScene)
    window.rootViewController = ViewController()
    window.backgroundColor = UIColor(red: 0.973, green: 0.980, blue: 0.984, alpha: 1)
    self.window = window
    window.makeKeyAndVisible()
  }
}
