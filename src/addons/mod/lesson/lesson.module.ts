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
import { AddonModLessonComponentsModule } from './components/components.module';
import { SITE_SCHEMA, OFFLINE_SITE_SCHEMA, SYNC_SITE_SCHEMA } from './services/database/lesson';
import { AddonModLessonGradeLinkHandler } from './services/handlers/grade-link';
import { AddonModLessonIndexLinkHandler } from './services/handlers/index-link';
import { AddonModLessonListLinkHandler } from './services/handlers/list-link';
import { AddonModLessonModuleHandler, AddonModLessonModuleHandlerService } from './services/handlers/module';
import { AddonModLessonPrefetchHandler } from './services/handlers/prefetch';
import { AddonModLessonPushClickHandler } from './services/handlers/push-click';
import { AddonModLessonReportLinkHandler } from './services/handlers/report-link';
import { AddonModLessonSyncCronHandler } from './services/handlers/sync-cron';

const routes: Routes = [
    {
        path: AddonModLessonModuleHandlerService.PAGE_NAME,
        loadChildren: () => import('./lesson-lazy.module').then(m => m.AddonModLessonLazyModule),
    },
];

@NgModule({
    imports: [
        CoreMainMenuTabRoutingModule.forChild(routes),
        AddonModLessonComponentsModule,
    ],
    providers: [
        {
            provide: CORE_SITE_SCHEMAS,
            useValue: [SITE_SCHEMA, OFFLINE_SITE_SCHEMA, SYNC_SITE_SCHEMA],
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            multi: true,
            deps: [],
            useFactory: () => () => {
                CoreCourseModuleDelegate.instance.registerHandler(AddonModLessonModuleHandler.instance);
                CoreCourseModulePrefetchDelegate.instance.registerHandler(AddonModLessonPrefetchHandler.instance);
                CoreCronDelegate.instance.register(AddonModLessonSyncCronHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModLessonGradeLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModLessonIndexLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModLessonListLinkHandler.instance);
                CoreContentLinksDelegate.instance.registerHandler(AddonModLessonReportLinkHandler.instance);
                CorePushNotificationsDelegate.instance.registerClickHandler(AddonModLessonPushClickHandler.instance);
            },
        },
    ],
})
export class AddonModLessonModule {}