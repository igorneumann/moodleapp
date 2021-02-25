// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { APP_INITIALIZER, NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { CoreContentLinksDelegate } from '@features/contentlinks/services/contentlinks-delegate';

import { CoreCourseModuleDelegate } from '@features/course/services/module-delegate';
import { CoreCourseModulePrefetchDelegate } from '@features/course/services/module-prefetch-delegate';
import { CoreMainMenuTabRoutingModule } from '@features/mainmenu/mainmenu-tab-routing.module';
import { CorePushNotificationsDelegate } from '@features/pushnotifications/services/push-delegate';
import { CoreCronDelegate } from '@services/cron';
import { CORE_SITE_SCHEMAS } from '@services/sites';
import { AddonModQuizAccessRulesModule } from './accessrules/accessrules.module';
import { AddonModQuizComponentsModule } from './components/components.module';
import { SITE_SCHEMA } from './services/database/quiz';
import { AddonModQuizGradeLinkHandler } from './services/handlers/grade-link';
import { AddonModQuizIndexLinkHandler } from './services/handlers/index-link';
import { AddonModQuizListLinkHandler } from './services/handlers/list-link';
import { AddonModQuizModuleHandler, AddonModQuizModuleHandlerService } from './services/handlers/module';
import { AddonModQuizPrefetchHandler } from './services/handlers/prefetch';
import { AddonModQuizPushClickHandler } from './services/handlers/push-click';
import { AddonModQuizReviewLinkHandler } from './services/handlers/review-link';
import { AddonModQuizSyncCronHandler } from './services/handlers/sync-cron';

const routes: Routes = [
    {
        path: AddonModQuizModuleHandlerService.PAGE_NAME,
        loadChildren: () => import('./quiz-lazy.module').then(m => m.AddonModQuizLazyModule),
    },
];

@NgModule({
    imports: [
        CoreMainMenuTabRoutingModule.forChild(routes),
        AddonModQuizComponentsModule,
        AddonModQuizAccessRulesModule,
    ],
    providers: [
        {
            provide: CORE_SITE_SCHEMAS,
            useValue: [SITE_SCHEMA],
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [],
            useFactory: () => () => {
                CoreCourseModuleDelegate.instance.registerHandler(AddonModQuizModuleHandler.instance);
                CoreCourseModulePrefetchDelegate.instance.registerHandler(AddonModQuizPrefetchHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModQuizGradeLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModQuizIndexLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModQuizListLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModQuizReviewLinkHandler.instance);
                CorePushNotificationsDelegate.instance.registerClickHandler(AddonModQuizPushClickHandler.instance);
                CoreCronDelegate.instance.register(AddonModQuizSyncCronHandler.instance);
            },
        },
    ],
})
export class AddonModQuizModule {}