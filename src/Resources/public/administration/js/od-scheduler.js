!function(e){var t={};function n(i){if(t[i])return t[i].exports;var o=t[i]={i:i,l:!1,exports:{}};return e[i].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(i,o,function(t){return e[t]}.bind(null,o));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/bundles/administration/",n(n.s="OOyw")}({"1Zl4":function(e,t,n){var i=n("f+1/");"string"==typeof i&&(i=[[e.i,i,""]]),i.locals&&(e.exports=i.locals);(0,n("SZ7m").default)("025c5d7c",i,!0,{})},"7Avc":function(e,t,n){},GnTL:function(e,t,n){var i=n("7Avc");"string"==typeof i&&(i=[[e.i,i,""]]),i.locals&&(e.exports=i.locals);(0,n("SZ7m").default)("26eff0ed",i,!0,{})},"H/7b":function(e,t){e.exports='{% block job_detail_page %}\n    <sw-page v-if="jobId" class="sw-order-detail">\n        {% block job_detail_header %}\n            <template #smart-bar-header>\n                {% block job_detail_header_title %}\n                    <h2>\n                        {{ jobItem.name }}\n                    </h2>\n                {% endblock %}\n            </template>\n        {% endblock %}\n        {% block job_detail_actions %}\n            <template #smart-bar-actions>\n                <sw-button\n                        :disabled="disableRescheduling(jobItem)"\n                        @click="rescheduleJob"\n                        class="sw-order-detail__smart-bar-edit-button"\n                        variant="primary"\n                >\n                    {{ $tc(\'job-listing.actions.reschedule-job.button.label\') }}\n                </sw-button>\n                <sw-button\n                        @click="showModal(jobMessages)"\n                        class="sw-order-detail__smart-bar-edit-button"\n                        variant="primary"\n                >\n                    {{ $tc(\'job-listing.actions.show-messages.button.label\') }}\n                </sw-button>\n            </template>\n        {% endblock %}\n        {% block job_detail_content %}\n            <template #content>\n                <sw-card :title="$tc(\'job-listing.page.detail.textHeadline\')">\n                    {% block job_row_primary %}\n                        <sw-card-section divider="bottom">\n                            {% block job_detail_base_overview_columns %}\n                                <sw-container\n                                        columns="repeat(auto-fit, minmax(250px, 1fr))"\n                                        gap="30px 30px">\n                                    {% block job_detail_base_overview_left_column %}\n                                        <sw-description-list\n                                                columns="1fr"\n                                                grid="1fr">\n                                            {% block job_detail_base_overview_name %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.name\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.name"\n                                                                           :value="jobItem.name" :editable="false"\n                                                    />\n                                                </dd>\n                                            {% endblock %}\n                                            {% block job_detail_base_overview_status %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.status\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.status"\n                                                                           :value="jobItem.status" :editable="false"\n                                                    />\n                                                </dd>\n                                            {% endblock %}\n                                            {% block job_detail_base_overview_startedAt %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.started-at\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.startedAt"\n                                                                           :value="jobItem.startedAt" :editable="false"\n                                                    />\n                                                </dd>\n                                            {% endblock %}\n                                        </sw-description-list>\n                                    {% endblock %}\n                                    {% block sw_order_detail_base_order_overview_right_column %}\n                                        <sw-description-list\n                                                columns="1fr"\n                                                grid="1fr" class="sw-order-user-card__summary-vertical">\n                                            {% block job_detail_base_overview_type %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.type\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.type"\n                                                                           :value="jobItem.type" :editable="false"\n                                                    />\n                                                </dd>\n                                            {% endblock %}\n                                            {% block job_detail_base_overview_createdAt %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.created-at\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.createdAt"\n                                                                           :value="jobItem.startedAt"\n                                                                           :editable="false"/>\n                                                </dd>\n                                            {% endblock %}\n                                            {% block job_detail_base_overview_finishedAt %}\n                                                <dt>{{ $tc(\'job-listing.page.listing.grid.column.finished-at\') }}</dt>\n                                                <dd>\n                                                    <sw-order-inline-field :display-value="jobItem.finishedAt"\n                                                                           :value="jobItem.finishedAt"\n                                                                           :editable="false"/>\n                                                </dd>\n                                            {% endblock %}\n                                        </sw-description-list>\n                                    {% endblock %}\n                                </sw-container>\n                            {% endblock %}\n                        </sw-card-section>\n                    {% endblock %}\n                </sw-card>\n                <sw-card v-if="(jobChildren && jobChildren.total > 0)"\n                         :title="$tc(\'job-listing.page.detail.jobChildrenTitle\')">\n                    {% block job_children_listing %}\n                        <sw-data-grid\n                                v-if="jobChildren"\n                                :items="jobChildren"\n                                :data-source="jobChildren"\n                                :repository="jobRepository"\n                                :showSelection="false"\n                                :allowColumnEdit="false"\n                                :allowDelete="false"\n                                :allowEdit="false"\n                                :columns="jobChildrenColumns">\n                            <template #column-name="{ item }">\n                                {% block job_list_grid_job_name_link %}\n                                    <router-link :to="{ name: \'job.listing.detail\', params: { id: item.id } }">\n                                        {{ item.name }}\n                                    </router-link>\n                                {% endblock %}\n                            </template>\n                            <template #actions="{ item }">\n                                <sw-context-menu-item :disabled="disableRescheduling(item)"\n                                                      @click="rescheduleJob">\n                                    {{ $tc(\'job-listing.actions.reschedule-job.button.label\') }}\n                                </sw-context-menu-item>\n                            </template>\n                        </sw-data-grid>\n                    {% endblock %}\n                </sw-card>\n                <sw-modal v-if="showModal !== null" closable  @modal-close="closeModal">\n                    <sw-card v-if="(jobMessages && jobMessages.total > 0)"\n                             :title="$tc(\'job-listing.page.detail.jobChildrenTitle\')">\n                        {% block job_messages_listing %}\n                            <sw-data-grid\n                                    v-if="jobMessages"\n                                    :items="jobMessages"\n                                    :data-source="jobMessages"\n                                    :showSelection="false"\n                                    :allowColumnEdit="false"\n                                    :allowDelete="false"\n                                    :allowEdit="false"\n                                    :columns="jobMessagesColumns">\n                            </sw-data-grid>\n                        {% endblock %}\n                    </sw-card>\n                </sw-modal>\n\n            </template>\n        {% endblock %}\n    </sw-page>\n{% endblock %}\n'},HfWT:function(e){e.exports=JSON.parse('{"job-listing":{"general":{"title":"Job Listing Pages","description":"job-listing"},"menu":{"title":"Job Listing"},"page":{"listing":{"title":"Job Listing","description":"List of Jobs","grid":{"column":{"type":"Type","message":"Message","status":"Status","name":"Name","started-at":"Started at","finished-at":"Finished at","created-at":"Created at"}}},"detail":{"textHeadline":"Job","jobChildrenTitle":"Job Children"}},"actions":{"reschedule-job":{"button":{"label":"Reschedule job"}},"show-messages":{"button":{"label":"Show messages"}}}}}')},IQ9u:function(e,t){e.exports='{% block job_listing_page %}\n    <sw-page class="swag-example-list">\n        <template slot="content">\n            <sw-entity-listing\n                    v-if="jobItems"\n                    :items="jobItems"\n                    :repository="jobRepository"\n                    :showSelection="false"\n                    :allowColumnEdit="false"\n                    :allowDelete="false"\n                    :allowEdit="false"\n                    :columns="columns">\n                <template #column-name="{ item }">\n                    {% block job_list_grid_job_name_link %}\n                        <router-link :to="{ name: \'job.listing.detail\', params: { id: item.id } }">\n                            {{ item.name }}\n                        </router-link>\n                    {% endblock %}\n                </template>\n                <template #actions="{ item }">\n                    <sw-context-menu-item :disabled="disableRescheduling(item)" @click="rescheduleJob">\n                        {{ $tc(\'job-listing.actions.reschedule-job.button.label\') }}\n                    </sw-context-menu-item>\n                </template>\n            </sw-entity-listing>\n        </template>\n    </sw-page>\n{% endblock %}'},OOyw:function(e,t,n){"use strict";n.r(t);var i=n("IQ9u"),o=n.n(i),s=(n("1Zl4"),Shopware.Component),l=Shopware.Data.Criteria;s.register("job-listing-index",{template:o.a,inject:["repositoryFactory"],props:{type:{type:String,required:!0,default:"test"}},computed:{columns:function(){return this.getColumns()},jobRepository:function(){return this.repositoryFactory.create("od_scheduler_job")}},created:function(){this.createdComponent()},data:function(){return{jobItems:null}},methods:{createdComponent:function(){var e=this,t=new l;return t.addFilter(l.equalsAny("type",[this.type])),this.jobRepository.search(t,Shopware.Context.api).then((function(t){e.jobItems=t}))},getColumns:function(){return[{property:"status",label:this.$tc("job-listing.page.listing.grid.column.status"),allowResize:!0},{property:"name",label:this.$tc("job-listing.page.listing.grid.column.name"),allowResize:!0},{property:"startedAt",label:this.$tc("job-listing.page.listing.grid.column.started-at"),allowResize:!0},{property:"finishedAt",label:this.$tc("job-listing.page.listing.grid.column.finished-at"),allowResize:!0},{property:"createdAt",label:this.$tc("job-listing.page.listing.grid.column.created-at"),allowResize:!0}]},disableRescheduling:function(e){return"failed"!==e.status},rescheduleJob:function(){return!0}}});var a=n("H/7b"),r=n.n(a),d=(n("GnTL"),Shopware.Component),c=Shopware.Data.Criteria;d.register("job-detail-index",{template:r.a,inject:["repositoryFactory"],props:{jobId:{type:String,required:!1,default:null}},data:function(){return console.log(this.displayedLog+"1"),{parentRoute:null,jobItem:null,jobChildren:null,jobMessages:null,displayedLog:null}},computed:{jobRepository:function(){return this.repositoryFactory.create("od_scheduler_job")},jobMessagesRepository:function(){return this.repositoryFactory.create("od_scheduler_job_message")},jobChildrenColumns:function(){return this.getJobChildrenColumns()},jobMessagesColumns:function(){return this.getJobMessagesColumns()}},created:function(){this.createdComponent(),this.getJobChildren(),this.getJobMessages()},mounted:function(){this.mountedComponent()},methods:{createdComponent:function(){var e=this;return this.jobRepository.get(this.jobId,Shopware.Context.api,new c).then((function(t){e.jobItem=t}))},getJobChildren:function(){var e=this,t=new c;return t.addFilter(c.equalsAny("parentId",[this.jobId])),this.jobRepository.search(t,Shopware.Context.api).then((function(t){e.jobChildren=t}))},getJobChildrenColumns:function(){return[{property:"status",dataIndex:"status",label:this.$tc("job-listing.page.listing.grid.column.status"),allowResize:!1,align:"right",inlineEdit:!0,width:"90px"},{property:"name",dataIndex:"name",label:this.$tc("job-listing.page.listing.grid.column.name"),allowResize:!1,align:"right",inlineEdit:!0,width:"90px"},{property:"startedAt",dataIndex:"startedAt",label:this.$tc("job-listing.page.listing.grid.column.started-at"),allowResize:!1,align:"right",inlineEdit:!0,width:"90px"},{property:"finishedAt",dataIndex:"finishedAt",label:this.$tc("job-listing.page.listing.grid.column.finished-at"),allowResize:!0,align:"right",inlineEdit:!0,width:"90px"},{property:"createdAt",dataIndex:"createdAt",label:this.$tc("job-listing.page.listing.grid.column.created-at"),allowResize:!0,align:"right",inlineEdit:!0,width:"90px"}]},getJobMessages:function(){var e=this,t=new c;return t.addFilter(c.equalsAny("jobId",[this.jobId])),this.jobMessagesRepository.search(t,Shopware.Context.api).then((function(t){e.jobMessages=t}))},getJobMessagesColumns:function(){return[{property:"message",dataIndex:"message",label:this.$tc("job-listing.page.listing.grid.column.message"),allowResize:!1,align:"left",width:"90px"}]},mountedComponent:function(){this.initPage()},disableRescheduling:function(e){return"failed"!==e.status},rescheduleJob:function(){return!0},initPage:function(){this.$route.meta.parentPath&&(this.parentRoute=this.$route.meta.parentPath)},showModal:function(e){this.displayedLog=e},closeModal:function(){console.log(this.displayedLog+"2"),this.displayedLog=null}}});var u=n("HfWT");Shopware.Module.register("job-listing",{type:"plugin",title:"job-listing.general.title",description:"job-listing.general.description",color:"#F88962",icon:"default-avatar-multiple",snippets:{"en-GB":u},routes:{index:{component:"job-listing-index",path:"index"},detail:{component:"job-detail-index",path:"detail/:id",props:{default:function(e){return{jobId:e.params.id}}}}},navigation:[{id:"job-listing",label:"job-listing.menu.title",color:"#F88962",icon:"default-avatar-multiple",parent:"sw-marketing",position:100},{label:"job-listing.general.title",color:"#77ff3d",icon:"small-default-stack-line2",path:"job.listing.index",parent:"job-listing",position:100}]})},SZ7m:function(e,t,n){"use strict";function i(e,t){for(var n=[],i={},o=0;o<t.length;o++){var s=t[o],l=s[0],a={id:e+":"+o,css:s[1],media:s[2],sourceMap:s[3]};i[l]?i[l].parts.push(a):n.push(i[l]={id:l,parts:[a]})}return n}n.r(t),n.d(t,"default",(function(){return g}));var o="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!o)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var s={},l=o&&(document.head||document.getElementsByTagName("head")[0]),a=null,r=0,d=!1,c=function(){},u=null,b="data-vue-ssr-id",p="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function g(e,t,n,o){d=n,u=o||{};var l=i(e,t);return m(l),function(t){for(var n=[],o=0;o<l.length;o++){var a=l[o];(r=s[a.id]).refs--,n.push(r)}t?m(l=i(e,t)):l=[];for(o=0;o<n.length;o++){var r;if(0===(r=n[o]).refs){for(var d=0;d<r.parts.length;d++)r.parts[d]();delete s[r.id]}}}}function m(e){for(var t=0;t<e.length;t++){var n=e[t],i=s[n.id];if(i){i.refs++;for(var o=0;o<i.parts.length;o++)i.parts[o](n.parts[o]);for(;o<n.parts.length;o++)i.parts.push(h(n.parts[o]));i.parts.length>n.parts.length&&(i.parts.length=n.parts.length)}else{var l=[];for(o=0;o<n.parts.length;o++)l.push(h(n.parts[o]));s[n.id]={id:n.id,refs:1,parts:l}}}}function f(){var e=document.createElement("style");return e.type="text/css",l.appendChild(e),e}function h(e){var t,n,i=document.querySelector("style["+b+'~="'+e.id+'"]');if(i){if(d)return c;i.parentNode.removeChild(i)}if(p){var o=r++;i=a||(a=f()),t=y.bind(null,i,o,!1),n=y.bind(null,i,o,!0)}else i=f(),t=v.bind(null,i),n=function(){i.parentNode.removeChild(i)};return t(e),function(i){if(i){if(i.css===e.css&&i.media===e.media&&i.sourceMap===e.sourceMap)return;t(e=i)}else n()}}var j,w=(j=[],function(e,t){return j[e]=t,j.filter(Boolean).join("\n")});function y(e,t,n,i){var o=n?"":i.css;if(e.styleSheet)e.styleSheet.cssText=w(t,o);else{var s=document.createTextNode(o),l=e.childNodes;l[t]&&e.removeChild(l[t]),l.length?e.insertBefore(s,l[t]):e.appendChild(s)}}function v(e,t){var n=t.css,i=t.media,o=t.sourceMap;if(i&&e.setAttribute("media",i),u.ssrId&&e.setAttribute(b,t.id),o&&(n+="\n/*# sourceURL="+o.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}},"f+1/":function(e,t,n){}});