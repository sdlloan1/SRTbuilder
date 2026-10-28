import UIKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {

    static var orientationLock: UIInterfaceOrientationMask = .portrait

    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = WebViewController()
        window?.makeKeyAndVisible()
        return true
    }

    func application(
        _ application: UIApplication,
        supportedInterfaceOrientationsFor window: UIWindow?
    ) -> UIInterfaceOrientationMask {
        AppDelegate.orientationLock
    }
}

final class SRTStatusStyle {
    static let shared = SRTStatusStyle()
    var style: UIStatusBarStyle = .darkContent
    var hidden = false
}
