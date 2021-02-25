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

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoreCourse } from '@features/course/services/course';
import { IonRefresher } from '@ionic/angular';
import { CoreNavigator } from '@services/navigator';
import { CoreScreen } from '@services/screen';
import { CoreDomUtils } from '@services/utils/dom';
import { AddonModAssignSubmissionComponent } from '../../components/submission/submission';
import { AddonModAssign, AddonModAssignAssign } from '../../services/assign';

/**
 * Page that displays a submission.
 */
@Component({
    selector: 'page-addon-mod-assign-submission-review',
    templateUrl: 'submission-review.html',
})
export class AddonModAssignSubmissionReviewPage implements OnInit {

    @ViewChild(AddonModAssignSubmissionComponent) submissionComponent?: AddonModAssignSubmissionComponent;

    title = ''; // Title to display.
    moduleId!: number; // Module ID the submission belongs to.
    courseId!: number; // Course ID the assignment belongs to.
    submitId!: number; //  User that did the submission.
    blindId?: number; // Blinded user ID (if it's blinded).
    loaded = false; // Whether data has been loaded.
    canSaveGrades = false; // Whether the user can save grades.

    protected assign?: AddonModAssignAssign; // The assignment the submission belongs to.
    protected blindMarking = false; // Whether it uses blind marking.
    protected forceLeave = false; // To allow leaving the page without checking for changes.


    constructor(
        protected route: ActivatedRoute,
    ) { }

    /**
     * Component being initialized.
     */
    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.moduleId = CoreNavigator.instance.getRouteNumberParam('cmId')!;
            this.courseId = CoreNavigator.instance.getRouteNumberParam('courseId')!;
            this.submitId = CoreNavigator.instance.getRouteNumberParam('submitId') || 0;
            this.blindId = CoreNavigator.instance.getRouteNumberParam('blindId', params);

            this.fetchSubmission().finally(() => {
                this.loaded = true;
            });
        });
    }

    /**
     * Check if we can leave the page or not.
     *
     * @return Resolved if we can leave it, rejected if not.
     */
    ionViewCanLeave(): boolean | Promise<void> {
        if (!this.submissionComponent || this.forceLeave) {
            return true;
        }

        // Check if data has changed.
        return this.submissionComponent.canLeave();
    }

    /**
     * User entered the page.
     */
    ionViewDidEnter(): void {
        this.submissionComponent?.ionViewDidEnter();
    }

    /**
     * User left the page.
     */
    ionViewDidLeave(): void {
        this.submissionComponent?.ionViewDidLeave();
    }

    /**
     * Get the submission.
     *
     * @return Promise resolved when done.
     */
    protected async fetchSubmission(): Promise<void> {
        this.assign = await AddonModAssign.instance.getAssignment(this.courseId, this.moduleId);
        this.title = this.assign.name;

        this.blindMarking = !!this.assign.blindmarking && !this.assign.revealidentities;

        const gradeInfo = await CoreCourse.instance.getModuleBasicGradeInfo(this.moduleId);
        if (!gradeInfo) {
            return;
        }

        // Grades can be saved if simple grading.
        if (gradeInfo.advancedgrading && gradeInfo.advancedgrading[0] &&
                typeof gradeInfo.advancedgrading[0].method != 'undefined') {

            const method = gradeInfo.advancedgrading[0].method || 'simple';
            this.canSaveGrades = method == 'simple';
        } else {
            this.canSaveGrades = true;
        }
    }

    /**
     * Refresh all the data.
     *
     * @return Promise resolved when done.
     */
    protected async refreshAllData(): Promise<void> {
        const promises: Promise<void>[] = [];

        promises.push(AddonModAssign.instance.invalidateAssignmentData(this.courseId));
        if (this.assign) {
            promises.push(AddonModAssign.instance.invalidateSubmissionData(this.assign.id));
            promises.push(AddonModAssign.instance.invalidateAssignmentUserMappingsData(this.assign.id));
            promises.push(AddonModAssign.instance.invalidateSubmissionStatusData(
                this.assign.id,
                this.submitId,
                undefined,
                this.blindMarking,
            ));
        }

        try {
            await Promise.all(promises);
        } finally {
            this.submissionComponent && this.submissionComponent.invalidateAndRefresh(true);

            await this.fetchSubmission();
        }
    }

    /**
     * Refresh the data.
     *
     * @param refresher Refresher.
     */
    refreshSubmission(refresher?: CustomEvent<IonRefresher>): void {
        this.refreshAllData().finally(() => {
            refresher?.detail.complete();
        });
    }

    /**
     * Submit a grade and feedback.
     */
    async submitGrade(): Promise<void> {
        if (!this.submissionComponent) {
            return;
        }

        try {
            await this.submissionComponent.submitGrade();
            // Grade submitted, leave the view if not in tablet.
            if (!CoreScreen.instance.isTablet) {
                this.forceLeave = true;
                CoreNavigator.instance.back();
            }
        } catch (error) {
            CoreDomUtils.instance.showErrorModalDefault(error, 'core.error', true);
        }
    }

}