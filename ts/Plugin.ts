module PhaserI18n {
    export class Plugin extends Phaser.Plugin {

        private _language: string = 'en';

        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);

            Object.defineProperty(game, 'i18n', {
                value: this
            });

            this.addLocaleLoader();
            this.addLocaleFactory();
            this.addLocaleCreator();
        }

        public init(options: i18n.Options, ...plugins: any[]) {
            //Initilize with language
            i18next.use(new I18next.Backend(this.game));

            for (let i: number = 0; i < plugins.length; i++) {
                i18next.use(plugins[i]);
            }

            i18next.init(options);
        }

        public setLanguage(language: string = 'en') {
            i18next.changeLanguage(language);

            this.recursiveUpdateText(this.game.stage);
        }

        private recursiveUpdateText(obj: Phaser.Text | Phaser.BitmapText | PIXI.DisplayObjectContainer): void {
            if (obj instanceof Phaser.Text || obj instanceof Phaser.BitmapText) {
                (<any>obj).dirty = true;
            }

            if (obj.children && obj.children.length > 0) {
                obj.children.forEach((child: PIXI.DisplayObjectContainer) => {
                    this.recursiveUpdateText(child);
                });
            }
        }

        private addLocaleLoader() {
            (<PhaserI18n.LocaleLoader>Phaser.Loader.prototype).locale = function (key: string[], loadPath: string, namespaces?: string[]) {
                i18next.init(<i18n.Options>{
                    backend: {
                        loadPath: loadPath
                    }
                });

                i18next.loadLanguages(key, () => {
                    i18next.changeLanguage(key[0]);
                });

                if (namespaces) {
                    i18next.loadNamespaces(namespaces);
                }
            };
        }

        private addLocaleFactory() {
            (<PhaserI18n.LocaleObjectFactory>Phaser.GameObjectFactory.prototype).translatedText = function(x: number, y: number, text: string, style?: Phaser.PhaserTextStyle, interpolations?: any, group?: Phaser.Group) {
                if (group === undefined) { group = this.world; }
                return group.add(new PhaserI18n.TranslatedText(this.game, x, y, text, style, interpolations));
            };
            (<PhaserI18n.LocaleObjectFactory>Phaser.GameObjectFactory.prototype).translatedBitmapText = function(x: number, y: number, font: string, text?: string, size?: number, align?: string, interpolations?: any, group?: Phaser.Group) {
                if (group === undefined) { group = this.world; }
                return group.add(new PhaserI18n.TranslatedBitmapText(this.game, x, y, font, text, size, align, interpolations));
            };
        }

        private addLocaleCreator() {
            (<PhaserI18n.LocaleObjectCreator>Phaser.GameObjectCreator.prototype).translatedText = function(x: number, y: number, text: string, style?: Phaser.PhaserTextStyle, interpolations?: any) {
                return new PhaserI18n.TranslatedText(this.game, x, y, text, style, interpolations);
            };
            (<PhaserI18n.LocaleObjectCreator>Phaser.GameObjectCreator.prototype).translatedBitmapText = function(x: number, y: number, font: string, text?: string, size?: number, align?: string, interpolations?: any) {
                return new PhaserI18n.TranslatedBitmapText(this.game, x, y, font, text, size, align, interpolations);
            };
        }
    }
}
