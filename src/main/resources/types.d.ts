declare const resolve: (path: string) => import("@enonic-types/core").ResourceKey;

declare const app: {
  /**
   * The name of the application.
   */
  name: "no.item.forms";

  /**
   * Version of the application.
   */
  version: string;

  /**
   * Values from the application’s configuration file.
   * This can be set using $XP_HOME/config/<app.name>.cfg.
   * Every time the configuration is changed the app is restarted.
   */
  config: Record<string, string | undefined>;
};

declare const log: {
  /**
   * Log debug message.
   */
  debug: (...args: unknown[]) => void;

  /**
   * Log info message.
   */
  info: (...args: unknown[]) => void;

  /**
   * Log warning message.
   */
  warning: (...args: unknown[]) => void;

  /**
   * Log error message.
   */
  error: (...args: unknown[]) => void;
};

type NewBean = <T = unknown, Bean extends keyof XpBeans | string = string>(
  bean: Bean,
) => Bean extends keyof XpBeans ? XpBeans[Bean] : T;

/**
 * Javascript to Java bridge functions.
 *
 * @example
 * var bean = __.newBean('com.enonic.xp.MyJavaUtils');
 *
 * @example
 * return __.toNativeObject(bean.findArray(arrayName));
 *
 * @global
 * @namespace
 */
declare const __: {
  /**
   * Creates a new JavaScript bean that wraps the given Java class and makes its methods available to be called from JavaScript.
   */
  newBean: NewBean;
  /**
   * Converts arrays or complex Java objects to JSON.
   * @param value Value to convert
   */
  toNativeObject: <T = unknown>(value: T) => T;
  /**
   * Converts JSON to a Java Map structure that can be used as parameters to a Java method on a bean created with newBean.
   * @param value Value to convert
   */
  toScriptValue: <T = object>(value: T) => ScriptValue;
  /**
   * Add a disposer that is called when the app is stopped.
   * @param callback Function to call
   */
  disposer: (callback: (...args: unknown[]) => unknown) => void;
  /**
   * Converts a JavaScript variable that is undefined to a Java <code>null</code> object.
   * If the JavaScript variable is defined, it is returned as is.
   * @param value Value to convert
   */
  nullOrValue: <T = object>(value: T) => T | null | undefined;

  /**
   * Doc registerMock.
   *
   * @param name Name of mock.
   * @param value Value to register.
   */
  registerMock: (name: string, value: object) => void;
};
