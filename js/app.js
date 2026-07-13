/* ==================== 向阳口腔病例管理系统 - 核心应用 ==================== */

// ==================== 全局状态 ====================
const STATE = {
  currentUser: null,
  currentPage: 'dashboard',
  currentRecordId: null,
  currentRecord: null,
  selectedTeeth: [],
  toothConditions: {},  // { toothId: 'caries'|'loose'|'missing'|'custom:xxx' }
  patients: [],
  records: [],
  consentForms: [],
  githubConfig: {
    username: 'BlockQuery',
    repo: 'dental-records-data',
    token: ''
  },
  aiConfig: {
    apiKey: '',
    model: 'gemini-2.5-flash'
  },
  aiImageData: null,       // base64 of uploaded image
  aiAnalysisResult: null,  // parsed analysis result
  aiHistory: []            // [{ id, timestamp, thumbnail, result, rawText }]
};

// ==================== 知情同意书模板 ====================
const CONSENT_FORM_TEMPLATES = [
  {
    id: 'extraction',
    name: '拔牙知情同意书',
    category: '口腔外科',
    content: `拔牙知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________    身份证号：________________
诊断：________________
拟行手术：________________    麻醉方式：________________

尊敬的病友：
根据您的病情，您需要进行拔牙手术。拔牙是一种有创操作，在诊断明确、无手术禁忌症的情况下进行。但由于个体差异和医学发展的局限性，拔牙过程中及术后可能出现以下并发症和风险：

一、麻醉意外及过敏反应（包括局麻药过敏、中毒等），严重者可导致休克甚至危及生命；
二、拔牙过程中可能损伤邻牙、对颌牙，引起牙体缺损或松动；
三、牙根折断无法取出，需暂留观察或转上级医院处理；
四、拔牙创口感染、干槽症、术后出血或血肿形成；
五、上颌后牙拔除可能发生上颌窦穿孔，下颌后牙（尤其是阻生智齿）拔除可能损伤下牙槽神经，导致下唇及颏部暂时性或永久性麻木；
六、颞下颌关节损伤或脱位；
七、拔牙后邻牙或对颌牙可能出现移位、伸长；
八、患有高血压、心脏病、糖尿病、血液病等全身性疾病的患者，术中或术后可能出现并发症；
九、其他不可预见的意外情况。

我已详细阅读以上内容，经医生解释后我已完全理解，同意接受拔牙手术。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'root_canal',
    name: '根管治疗知情同意书',
    category: '牙体牙髓',
    content: `根管治疗知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________
诊断：________________    牙位：________________

尊敬的病友：
根据您的病情，您需要进行根管治疗。根管治疗是目前保留患牙最有效的方法之一，但治疗过程复杂且存在一定风险：

一、根管治疗通常需多次就诊完成（一般2-4次），需按时复诊，逾期可能导致治疗失败；
二、治疗过程中可能出现根管器械分离（断针），部分情况下可取出或作为根充材料留置，极少数情况需转诊或拔除患牙；
三、根管钙化不通、根管穿孔、台阶形成等可能导致治疗失败；
四、根管侧穿、髓室底穿等并发症可能导致患牙拔除；
五、牙隐裂或根折者，根管治疗后仍可能出现症状，严重者需拔除；
六、治疗期间可能出现肿痛等急性炎症反应，需对症处理；
七、根管治疗完成后，患牙因失去牙髓营养而变脆，建议及时行全冠修复保护，否则有牙折风险；
八、即使根管治疗成功，仍有约5%-10%的远期失败率，可能需行根管再治疗或根尖手术；
九、治疗费用：根管治疗费用按根管数收取，冠修复费用另计。

我已了解上述内容，同意接受根管治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'implant',
    name: '种植牙知情同意书',
    category: '口腔种植',
    content: `口腔种植修复知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________    身份证号：________________
诊断：________________
拟种植牙位：________________    种植系统：________________

尊敬的病友：
种植牙是目前口腔修复领域较先进的技术之一，通过外科手术将种植体植入牙槽骨内，待骨结合完成后进行上部修复。现就有关事项告知如下：

一、种植义齿修复周期较长，一般需3-6个月甚至更长时间，分为一期手术植入种植体、二期手术暴露种植体、取模制作牙冠、戴牙等步骤；
二、术前需进行全面检查（包括CBCT等），评估牙槽骨条件是否满足种植要求；
三、种植手术需在局麻下进行，手术过程中可能出现：
  1. 麻醉意外及过敏反应；
  2. 术中损伤邻牙、神经、血管，导致暂时性或永久性麻木、出血等；
  3. 上颌后牙区种植可能发生上颌窦穿孔；
  4. 下颌后牙区种植可能损伤下牙槽神经；
四、术后可能出现肿胀、疼痛、感染、创口裂开、种植体周围炎等并发症；
五、种植体与骨组织结合失败（骨结合失败率约2%-5%），需取出种植体，择期重新种植或改行其他修复方式；
六、种植牙修复完成后可能出现修复体脱落、崩瓷、螺丝松动、基台折断等机械并发症；
七、种植牙的远期成功率约90%-95%，需定期维护和复查，口腔卫生不良、吸烟、系统性疾病等因素会影响成功率；
八、种植修复费用较高，一般不含后期维护修理费用。
九、术前需如实告知全身性疾病史（如高血压、心脏病、糖尿病、骨质疏松、凝血功能障碍等）及用药史。

我已详细了解上述内容，经医师充分解释后，同意接受口腔种植修复治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'orthodontics',
    name: '正畸治疗知情同意书',
    category: '口腔正畸',
    content: `口腔正畸治疗知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________
诊断：________________
拟行矫治方案：________________    预计疗程：________________

尊敬的病友：
根据您的口腔情况，建议进行正畸（牙齿矫正）治疗。正畸治疗可改善牙齿排列、咬合关系及面部美观，但治疗过程较长，存在以下风险和注意事项：

一、正畸治疗周期一般1-3年不等，需按时复诊（通常4-6周一次），逾期复诊将延长疗程；
二、矫治器（托槽、钢丝、隐形牙套等）佩戴初期可能出现不适、疼痛、口腔溃疡等，属正常反应；
三、治疗过程中需格外注意口腔卫生，否则易发生牙龈炎、牙周炎、龋齿（蛀牙）、牙齿脱矿（白斑）等问题；
四、正畸治疗可能引起牙根轻度吸收（通常<1mm），一般不影响牙齿功能和寿命；
五、部分病例治疗后可能出现一定程度复发，需按医嘱佩戴保持器（通常需佩戴1-2年或更长时间）；
六、复杂的错颌畸形可能需配合正颌外科手术治疗，或需拔除部分牙齿（通常为前磨牙）；
七、颞下颌关节紊乱患者，正畸治疗可能改善、不变或加重症状；
八、治疗费用因方案而异，通常分期支付，保持器费用另计；
九、治疗过程中矫治器损坏需及时修复，可能产生额外费用。

我已了解上述内容，同意接受正畸治疗并按医嘱配合。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'periodontal',
    name: '牙周治疗知情同意书',
    category: '牙周科',
    content: `牙周治疗知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________
诊断：________________
拟行治疗：________________

尊敬的病友：
根据您的口腔检查结果，您患有牙周疾病，需要进行牙周系统治疗。现将治疗相关事项告知如下：

一、牙周病是牙齿支持组织（牙龈、牙周膜、牙槽骨）的慢性感染性疾病，是导致成人失牙的主要原因；
二、牙周基础治疗包括：口腔卫生指导、龈上洁治（洗牙）、龈下刮治和根面平整，通常需分2-4次完成；
三、治疗过程中可能出现牙龈出血、治疗后牙齿敏感（冷热刺激痛）、牙龈退缩等，多为暂时性；
四、治疗后短期内牙齿可能出现轻度松动或松动加重，属正常反应；
五、牙周治疗后牙龈可能发生退缩，导致牙根暴露、牙间隙增宽、美观受影响；
六、牙周病为慢性病，治疗后需长期维护（通常3-6个月复查一次），否则易复发；
七、严重牙周炎患者在基础治疗后可能需要牙周手术治疗（如翻瓣术、植骨术等）；
八、牙周治疗不能使已破坏的牙槽骨完全再生，治疗效果有个体差异；
九、有全身性疾病者（如糖尿病、心血管疾病等），牙周治疗前后需控制好全身状况。

我已详细阅读并理解以上内容，同意接受牙周系统治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'filling',
    name: '补牙知情同意书',
    category: '牙体牙髓',
    content: `牙体充填修复知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________
诊断：________________    牙位：________________
拟行修复方式：________________    充填材料：________________

尊敬的病友：
根据检查，您的牙齿需要进行充填修复（补牙）治疗。现将相关事项告知如下：

一、充填修复治疗目的是去除龋坏组织、修复牙体外形、恢复咀嚼功能；
二、去龋过程中可能意外穿髓（露神经），需改行根管治疗或活髓保存治疗；
三、牙齿龋坏较深时，充填后可能出现冷热刺激痛、自发痛等症状，部分属正常术后反应，部分可能需进一步治疗；
四、充填材料（树脂、玻璃离子等）可能存在微渗漏、变色、磨损、脱落等情况，需重新充填；
五、大面积缺损修复后，剩余牙体组织可能薄弱，有牙折风险，建议行全冠修复保护；
六、前牙美学修复的效果受多种因素影响，颜色可能与天然牙存在细微差异；
七、术后可能出现咬合不适，需及时复诊调合。

我已了解上述内容，同意接受充填修复治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'prosthodontics',
    name: '修复治疗知情同意书',
    category: '口腔修复',
    content: `口腔修复治疗知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________
诊断：________________
拟行修复方案：________________    修复材料：________________

尊敬的病友：
根据您的口腔情况，建议进行义齿修复治疗（包括冠、桥、活动义齿等）。现将相关事项告知如下：

一、固定义齿（全冠、固定桥）修复：
  1. 牙体预备需磨除一定量的健康牙体组织，可能出现术后敏感，一般可恢复；
  2. 预备过程中牙髓可能受到刺激，少数情况需行根管治疗；
  3. 临时冠佩戴期间避免咀嚼硬物；
  4. 修复体粘结后可能出现咬合不适，需复诊调合；
  5. 烤瓷熔附金属冠可能出现牙龈边缘变色、崩瓷等问题；
  6. 全瓷冠美观效果好，但强度略低，有崩裂风险。

二、可摘局部义齿修复：
  1. 初戴时可能有异物感、恶心、发音不清等，属正常适应过程；
  2. 基托卡环可能对基牙和黏膜造成一定损伤；
  3. 义齿需定期复诊调整，基牙和组织面随使用而变化；
  4. 义齿使用多年后可能因口腔条件改变而需重衬或重做。

三、总义齿修复：
  1. 全口义齿固位力有限，尤其在牙槽骨严重吸收者；
  2. 需较长时间适应，咀嚼效率低于天然牙；
  3. 需定期复诊检查口腔黏膜状况。

我已了解上述内容，同意接受口腔修复治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  },
  {
    id: 'oral_surgery',
    name: '口腔手术知情同意书',
    category: '口腔外科',
    content: `口腔手术知情同意书

患者姓名：________________    性别：______    年龄：______
联系电话：________________    身份证号：________________
诊断：________________
拟行手术：________________    麻醉方式：________________

尊敬的病友：
根据您的病情，您需要进行口腔手术治疗。手术是一种侵入性操作，存在一定风险和并发症，现告知如下：

一、麻醉意外及过敏反应，严重者可导致休克甚至危及生命；
二、术中出血，根据手术范围不同，出血量不同；有凝血功能障碍者出血风险增加；
三、术后创口感染，需抗生素治疗；
四、术后肿胀、疼痛，通常数日至一周内缓解；
五、根据手术部位不同可能出现：
  1. 损伤邻近神经导致暂时性或永久性麻木；
  2. 损伤邻牙或健康牙体组织；
  3. 上颌手术可能发生上颌窦穿孔或口腔-上颌窦瘘；
六、术后瘢痕形成，可能影响功能和美观；
七、手术切除组织需送病理检查，如病理结果为恶性需进一步治疗；
八、术后复发可能（如囊肿、肿瘤等病变）；
九、其他不可预见的意外情况。

我已详细阅读并理解上述内容，经医师充分解释后，同意接受手术治疗。

患者（或监护人）签名：________________
日期：________年______月______日

医生签名：________________
日期：________年______月______日`
  }
];

// ==================== FDI 牙位数据（四象限） ====================
const PERMANENT_TEETH = {
  UR: [
    { id: '18', label: '18', name: '第三磨牙(智齿)' },
    { id: '17', label: '17', name: '第二磨牙' },
    { id: '16', label: '16', name: '第一磨牙' },
    { id: '15', label: '15', name: '第二前磨牙' },
    { id: '14', label: '14', name: '第一前磨牙' },
    { id: '13', label: '13', name: '尖牙' },
    { id: '12', label: '12', name: '侧切牙' },
    { id: '11', label: '11', name: '中切牙' }
  ],
  UL: [
    { id: '21', label: '21', name: '中切牙' },
    { id: '22', label: '22', name: '侧切牙' },
    { id: '23', label: '23', name: '尖牙' },
    { id: '24', label: '24', name: '第一前磨牙' },
    { id: '25', label: '25', name: '第二前磨牙' },
    { id: '26', label: '26', name: '第一磨牙' },
    { id: '27', label: '27', name: '第二磨牙' },
    { id: '28', label: '28', name: '第三磨牙(智齿)' }
  ],
  LR: [
    { id: '48', label: '48', name: '第三磨牙(智齿)' },
    { id: '47', label: '47', name: '第二磨牙' },
    { id: '46', label: '46', name: '第一磨牙' },
    { id: '45', label: '45', name: '第二前磨牙' },
    { id: '44', label: '44', name: '第一前磨牙' },
    { id: '43', label: '43', name: '尖牙' },
    { id: '42', label: '42', name: '侧切牙' },
    { id: '41', label: '41', name: '中切牙' }
  ],
  LL: [
    { id: '31', label: '31', name: '中切牙' },
    { id: '32', label: '32', name: '侧切牙' },
    { id: '33', label: '33', name: '尖牙' },
    { id: '34', label: '34', name: '第一前磨牙' },
    { id: '35', label: '35', name: '第二前磨牙' },
    { id: '36', label: '36', name: '第一磨牙' },
    { id: '37', label: '37', name: '第二磨牙' },
    { id: '38', label: '38', name: '第三磨牙(智齿)' }
  ]
};

const PRIMARY_TEETH = {
  UR: [
    { id: '55', label: 'V', name: '第二乳磨牙' },
    { id: '54', label: 'IV', name: '第一乳磨牙' },
    { id: '53', label: 'III', name: '乳尖牙' },
    { id: '52', label: 'II', name: '乳侧切牙' },
    { id: '51', label: 'I', name: '乳中切牙' }
  ],
  UL: [
    { id: '61', label: 'I', name: '乳中切牙' },
    { id: '62', label: 'II', name: '乳侧切牙' },
    { id: '63', label: 'III', name: '乳尖牙' },
    { id: '64', label: 'IV', name: '第一乳磨牙' },
    { id: '65', label: 'V', name: '第二乳磨牙' }
  ],
  LR: [
    { id: '85', label: 'V', name: '第二乳磨牙' },
    { id: '84', label: 'IV', name: '第一乳磨牙' },
    { id: '83', label: 'III', name: '乳尖牙' },
    { id: '82', label: 'II', name: '乳侧切牙' },
    { id: '81', label: 'I', name: '乳中切牙' }
  ],
  LL: [
    { id: '71', label: 'I', name: '乳中切牙' },
    { id: '72', label: 'II', name: '乳侧切牙' },
    { id: '73', label: 'III', name: '乳尖牙' },
    { id: '74', label: 'IV', name: '第一乳磨牙' },
    { id: '75', label: 'V', name: '第二乳磨牙' }
  ]
};

const QUADRANT_LABELS = { UR: '右上', UL: '左上', LR: '右下', LL: '左下' };
let toothType = 'permanent'; // 'permanent' | 'primary'

// ==================== 工具函数 ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function generateId() { return 'rec_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6); }

// 身份证自动计算年龄和性别
function autoFillFromIdCard() {
  const idCard = $('#patientIdCard').value.trim();
  if (idCard.length !== 18) return;

  // 出生日期：第7-14位 YYYYMMDD
  const birthStr = idCard.substring(6, 14);
  if (!/^\d{8}$/.test(birthStr)) return;
  const birthYear = parseInt(birthStr.substring(0, 4));
  const birthMonth = parseInt(birthStr.substring(4, 6));
  const birthDay = parseInt(birthStr.substring(6, 8));
  const birth = new Date(birthYear, birthMonth - 1, birthDay);
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  if (today.getMonth() < birthMonth - 1 || (today.getMonth() === birthMonth - 1 && today.getDate() < birthDay)) {
    age--;
  }
  if (age >= 0 && age <= 150) {
    $('#patientAge').value = age;
  }

  // 性别：第17位，奇=男 偶=女
  const genderCode = parseInt(idCard.charAt(16));
  if (!isNaN(genderCode)) {
    $('#patientGender').value = (genderCode % 2 === 1) ? '男' : '女';
  }
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') +
    ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
}
function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icons = { success: '&#10003;', error: '&#10007;', warning: '&#9888;', info: '&#8505;' };
  toast.innerHTML = '<span>' + icons[type] + '</span> ' + message;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// ==================== 治疗类型多选辅助 ====================
function getSelectedTreatments() {
  const checks = document.querySelectorAll('input[name="treatmentType"]:checked');
  return Array.from(checks).map(c => c.value);
}

function setSelectedTreatments(treatmentStr) {
  if (!treatmentStr) return;
  const values = treatmentStr.split('、');
  document.querySelectorAll('input[name="treatmentType"]').forEach(cb => {
    cb.checked = values.includes(cb.value);
  });
}

// 治疗类型勾选后自动追加到治疗方案
let _syncingPlan = false;
function syncTreatmentsToPlan() {
  if (_syncingPlan) return;
  const treatments = getSelectedTreatments();
  if (treatments.length === 0) return;
  const planEl = $('#treatmentPlan');
  let plan = planEl.value.trim();
  // 追加治疗类型提示
  const prefix = '治疗项目：' + treatments.join('、');
  if (plan.includes('治疗项目：')) {
    // 替换已有的治疗项目行
    plan = plan.replace(/治疗项目：[^\n]*/, prefix);
  } else {
    plan = plan ? prefix + '\n' + plan : prefix;
  }
  _syncingPlan = true;
  planEl.value = plan;
  setTimeout(() => { _syncingPlan = false; }, 100);
}

// ==================== 数据持久化 ====================
function saveLocalData() {
  const data = {
    patients: STATE.patients,
    records: STATE.records,
    consentForms: STATE.consentForms
  };
  localStorage.setItem('dental_records_data', JSON.stringify(data));
}

function loadLocalData() {
  try {
    const raw = localStorage.getItem('dental_records_data');
    if (raw) {
      const data = JSON.parse(raw);
      STATE.patients = data.patients || [];
      STATE.records = data.records || [];
      STATE.consentForms = data.consentForms || [];
    }
  } catch (e) {
    console.error('数据加载失败:', e);
    STATE.patients = [];
    STATE.records = [];
    STATE.consentForms = [];
  }
}

// ==================== 数据合并工具 ====================
// 按 id 合并两个数组，保留时间戳较新(updatedAt/createdAt)的版本；用于导入/拉取时安全合并而非覆盖
function mergeById(target, incoming) {
  const map = new Map();
  (target || []).forEach(item => { if (item && item.id) map.set(item.id, item); });
  (incoming || []).forEach(item => {
    if (!item || !item.id) return;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const tNew = new Date(item.updatedAt || item.createdAt || 0).getTime();
      const tOld = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
      if (tNew >= tOld) map.set(item.id, item);
    }
  });
  return [...map.values()];
}

// 以病例记录为基准重建患者列表，保证患者与记录始终一致
function rebuildPatientsFromRecords() {
  const map = new Map();
  STATE.records.forEach(r => {
    if (!r.patientName) return;
    const key = r.patientName + '|' + (r.phone || '');
    let p = map.get(key);
    if (!p) {
      p = {
        id: generateId(),
        name: r.patientName,
        gender: r.gender || '',
        age: r.age || '',
        phone: r.phone || '',
        lastVisit: r.updatedAt || r.createdAt || '',
        recordCount: 0
      };
      map.set(key, p);
    }
    p.recordCount++;
    const tNew = new Date(r.updatedAt || r.createdAt || 0).getTime();
    const tOld = new Date(p.lastVisit || 0).getTime();
    if (tNew > tOld) p.lastVisit = r.updatedAt || r.createdAt;
  });
  STATE.patients = [...map.values()];
}

function saveGitHubConfig() {
  localStorage.setItem('dental_github_config', JSON.stringify(STATE.githubConfig));
}

function saveAiConfig() {
  localStorage.setItem('dental_ai_config', JSON.stringify(STATE.aiConfig));
}

function loadAiConfig() {
  try {
    const raw = localStorage.getItem('dental_ai_config');
    if (raw) STATE.aiConfig = JSON.parse(raw);
  } catch(e) {}
  // 同步到 UI
  $('#aiApiKey').value = STATE.aiConfig.apiKey || '';
  $('#aiModel').value = STATE.aiConfig.model || 'gemini-2.5-flash';
}

function saveAiHistory() {
  try {
    localStorage.setItem('dental_ai_history', JSON.stringify(STATE.aiHistory.slice(0, 50)));
  } catch(e) {}
}

function loadAiHistory() {
  try {
    const raw = localStorage.getItem('dental_ai_history');
    if (raw) STATE.aiHistory = JSON.parse(raw);
  } catch(e) { STATE.aiHistory = []; }
}

// 是否本地运行（通过 HTTP 服务器访问，如 http://localhost:8000）。
// 公网部署（*.pages.dev 等）下 hostname 不是 localhost，此时禁止自动加载私钥文件。
const IS_LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);

function loadGitHubConfig() {
  try {
    const raw = localStorage.getItem('dental_github_config');
    if (raw) {
      STATE.githubConfig = JSON.parse(raw);
    }
    // 始终填充默认值到UI
    $('#githubUsername').value = STATE.githubConfig.username || 'BlockQuery';
    $('#githubRepo').value = STATE.githubConfig.repo || 'dental-records-data';
    $('#githubToken').value = STATE.githubConfig.token || '';
    // 未配置 token 时，仅 localhost 本地运行尝试从私钥文件自动加载；
    // 公网部署不含私钥文件，需用户在设置页手动填写 Token
    if (!STATE.githubConfig.token && IS_LOCAL) {
      fetch('github数据库私钥.txt')
        .then(r => r.ok ? r.text() : null)
        .then(t => {
          if (t && t.trim()) {
            STATE.githubConfig.token = t.trim();
            $('#githubToken').value = STATE.githubConfig.token;
            saveGitHubConfig();
          }
        })
        .catch(() => {});
    }
  } catch (e) {
    $('#githubUsername').value = 'BlockQuery';
    $('#githubRepo').value = 'dental-records-data';
  }
}

// 启动时初始化 GitHub 同步：先加载私钥，再安全合并拉取远程数据
function initGitHubSync() {
  const cfg = STATE.githubConfig;
  const tryAutoPull = () => {
    if (!(cfg.username && cfg.token)) return;
    fetch('https://api.github.com/repos/' + cfg.username + '/' + cfg.repo + '/contents/dental-data.json', {
      headers: { 'Authorization': 'token ' + cfg.token, 'Accept': 'application/vnd.github.v3+json' }
    })
    .then(res => res.json())
    .then(fileInfo => {
      if (fileInfo && fileInfo.content) {
        const content = JSON.parse(decodeURIComponent(escape(atob(fileInfo.content.replace(/\s/g, '')))));
        if (content.records && Array.isArray(content.records)) {
          // 安全合并：按 id 合并远程与本地，保留各自最新版本，不覆盖本地未同步记录
          STATE.patients = mergeById(STATE.patients, content.patients);
          STATE.records = mergeById(STATE.records, content.records);
          STATE.consentForms = mergeById(STATE.consentForms, content.consentForms);
          rebuildPatientsFromRecords();
          saveLocalData();
          renderDashboard();
          updateSyncStatus('success', '已同步');
        }
      }
    })
    .catch(() => {});
  };

  if (cfg.username && cfg.token) {
    tryAutoPull();
  } else if (IS_LOCAL) {
    // 仅 localhost 本地运行（HTTP服务器）时尝试自动加载 token
    fetch('github数据库私钥.txt')
      .then(r => r.ok ? r.text() : null)
      .then(t => {
        if (t && t.trim()) {
          cfg.token = t.trim();
          saveGitHubConfig();
          updateSyncStatus('success', '已加载私钥');
          tryAutoPull();
        }
      })
      .catch(() => {});
  } else {
    // 公网部署：不含私钥文件，提示用户在设置页手动配置 GitHub Token
    updateSyncStatus('warning', '请到设置页配置Token');
  }
}

// ==================== 认证模块 ====================
function handleLogin(e) {
  e.preventDefault();
  const phone = $('#loginPhone').value.trim();
  const password = $('#loginPassword').value.trim();
  const errorEl = $('#loginError');

  if (phone === '18686222247' && password === '1384760019900zB') {
    STATE.currentUser = { name: '郑博', phone: '18686222247', role: '口腔全科医生' };
    localStorage.setItem('dental_current_user', JSON.stringify(STATE.currentUser));
    errorEl.textContent = '';
    showLoginSuccess();
  } else {
    errorEl.textContent = '手机号或密码错误，请重试';
  }
}

function showLoginSuccess() {
  $('#loginPage').classList.remove('active');
  $('#appPage').classList.add('active');
  renderDashboard();
}

function checkAutoLogin() {
  try {
    const raw = localStorage.getItem('dental_current_user');
    if (raw) {
      STATE.currentUser = JSON.parse(raw);
      if (STATE.currentUser && STATE.currentUser.phone === '18686222247') {
        $('#loginPage').classList.remove('active');
        $('#appPage').classList.add('active');
        renderDashboard();
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function handleLogout() {
  localStorage.removeItem('dental_current_user');
  STATE.currentUser = null;
  $('#appPage').classList.remove('active');
  $('#loginPage').classList.add('active');
  $('#loginPhone').value = '';
  $('#loginPassword').value = '';
  showToast('已退出登录', 'info');
}

// ==================== 导航 ====================
function navigateTo(page) {
  STATE.currentPage = page;

  // Update nav
  $$('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  // Update content pages
  $$('.content-page').forEach(p => p.classList.remove('active'));
  const pageEl = $('#' + page + 'Page');
  if (pageEl) pageEl.classList.add('active');

  // Close sidebar on mobile
  $('#sidebar').classList.remove('open');

  // Render page content
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'patients': renderPatientList(); break;
    case 'newRecord': renderNewRecordForm(); break;
    case 'consentForms': renderConsentForms(); break;
    case 'aiExam': renderAiExamPage(); break;
    case 'settings': loadGitHubConfig(); break;
  }
}

// ==================== 牙位图（四象限+乳牙+条件标记） ====================
function renderToothChart() {
  const container = $('#toothChart');
  if (!container) return;

  const teethData = toothType === 'primary' ? PRIMARY_TEETH : PERMANENT_TEETH;
  const isPrimary = toothType === 'primary';

  let html = '';
  ['UR', 'UL', 'LR', 'LL'].forEach(quad => {
    const teeth = teethData[quad];
    html += '<div class="quadrant"><div class="quadrant-label">' + QUADRANT_LABELS[quad] + '</div><div class="quadrant-teeth' + (isPrimary ? ' tight' : '') + '">';
    teeth.forEach(tooth => {
      const cls = [];
      if (STATE.selectedTeeth.includes(tooth.id)) cls.push('selected');
      const cond = STATE.toothConditions[tooth.id];
      if (cond) cls.push('cond-' + cond.split(':')[0]); // 取基础类型
      const extraClass = isPrimary ? ' primary-tooth' : '';
      const title = tooth.id + ' ' + tooth.name + (cond ? ' [' + getCondLabel(cond) + ']' : '');
      html += '<div class="tooth-item' + extraClass + ' ' + cls.join(' ') + '" data-tooth="' + tooth.id + '" title="' + title + '">' + tooth.label + '</div>';
    });
    html += '</div></div>';
  });

  container.innerHTML = html;

  // 点击：始终为选中/取消选中
  container.querySelectorAll('.tooth-item').forEach(item => {
    item.addEventListener('click', function() {
      toggleTooth(this.dataset.tooth, this);
    });
  });

  updateSelectedTeethDisplay();
}

function applyConditionToSelected(cond) {
  if (STATE.selectedTeeth.length === 0) {
    showToast('请先选择牙位', 'warning');
    return;
  }
  if (cond === 'custom') {
    const label = prompt('请输入自定义标注（如：楔状缺损、隐裂）：', '');
    if (label === null || !label.trim()) return;
    STATE.selectedTeeth.forEach(tid => {
      STATE.toothConditions[tid] = 'custom:' + label.trim();
    });
  } else {
    STATE.selectedTeeth.forEach(tid => {
      // 同条件再点=取消，否则=设置
      if (STATE.toothConditions[tid] === cond) {
        delete STATE.toothConditions[tid];
      } else {
        STATE.toothConditions[tid] = cond;
      }
    });
  }
  renderToothChart();
  syncConditionsToOralExam();
}

function syncConditionsToOralExam() {
  const entries = Object.entries(STATE.toothConditions);
  if (entries.length === 0) return;
  const parts = entries.map(([tid, cond]) => tid + '(' + getCondLabel(cond) + ')');
  const line = '牙位标记：' + parts.join('、');
  const examEl = $('#oralExam');
  let text = examEl.value.trim();
  // 替换已有的牙位标记行，或追加
  if (text.includes('牙位标记：')) {
    text = text.replace(/牙位标记：[^\n]*/, line);
  } else {
    text = text ? text + '\n' + line : line;
  }
  examEl.value = text;
}

function getCondLabel(cond) {
  if (!cond) return '';
  if (cond === 'caries') return '龋病';
  if (cond === 'loose') return '松动';
  if (cond === 'missing') return '缺失';
  if (cond.startsWith('custom:')) return cond.replace('custom:', '');
  return cond;
}

function setConditionMode(cond) {
  applyConditionToSelected(cond);
}

function buildConditionSummary(record) {
  if (!record.toothConditions || Object.keys(record.toothConditions).length === 0) return '';
  const parts = [];
  Object.entries(record.toothConditions).forEach(([toothId, cond]) => {
    parts.push(toothId + '(' + getCondLabel(cond) + ')');
  });
  return parts.join(' ');
}

function toggleTooth(toothId, element) {
  const idx = STATE.selectedTeeth.indexOf(toothId);
  if (idx >= 0) {
    STATE.selectedTeeth.splice(idx, 1);
    element.classList.remove('selected');
  } else {
    STATE.selectedTeeth.push(toothId);
    element.classList.add('selected');
  }
  updateSelectedTeethDisplay();
}

function updateSelectedTeethDisplay() {
  const display = $('#selectedTeethDisplay');
  if (display) {
    if (STATE.selectedTeeth.length > 0) {
      const sorted = [...STATE.selectedTeeth].sort((a, b) => parseInt(a) - parseInt(b));
      display.textContent = '已选牙位：' + sorted.join('、');
    } else {
      display.textContent = '未选择牙位';
    }
  }
}

function switchToothType(type) {
  toothType = type;
  $('#btnPermanent').classList.toggle('active', type === 'permanent');
  $('#btnPrimary').classList.toggle('active', type === 'primary');
  STATE.selectedTeeth = [];
  renderToothChart();
}

// ==================== AI 口腔检查 ====================

function renderAiExamPage() {
  loadAiConfig();
  loadAiHistory();

  // 检查是否已配置 API Key
  const apiConfigCard = $('#aiApiConfigCard');
  if (!STATE.aiConfig.apiKey) {
    apiConfigCard.style.display = 'block';
  } else {
    apiConfigCard.style.display = 'none';
  }

  renderAiHistory();
}

// 保存AI配置
function handleAiConfigSave() {
  STATE.aiConfig.apiKey = $('#aiApiKey').value.trim();
  STATE.aiConfig.model = $('#aiModel').value;
  saveAiConfig();

  if (STATE.aiConfig.apiKey) {
    $('#aiApiConfigCard').style.display = 'none';
    showToast('AI配置已保存', 'success');
  } else {
    showToast('请输入API Key', 'warning');
  }
}

// 压缩图片到合理大小
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        const MAX_W = 1024;
        const MAX_H = 1024;
        let w = img.width, h = img.height;
        if (w > MAX_W || h > MAX_H) {
          const ratio = Math.min(MAX_W / w, MAX_H / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 处理图片上传
function handleAiImageUpload(file) {
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('请选择图片文件', 'error');
    return;
  }

  resizeImage(file).then(base64 => {
    STATE.aiImageData = base64;
    // 显示预览
    $('#aiPreviewImg').src = base64;
    $('#aiUploadPrompt').style.display = 'none';
    $('#aiImagePreview').style.display = 'block';
    $('#aiUploadActions').style.display = 'block';
    // 重置分析结果
    resetAiResult();
  }).catch(() => {
    showToast('图片加载失败', 'error');
  });
}

// 移除已上传图片
function removeAiImage() {
  STATE.aiImageData = null;
  $('#aiPreviewImg').src = '';
  $('#aiUploadPrompt').style.display = 'block';
  $('#aiImagePreview').style.display = 'none';
  $('#aiUploadActions').style.display = 'none';
  $('#aiImageInput').value = '';
  resetAiResult();
}

// 重置分析结果显示
function resetAiResult() {
  $('#aiResultEmpty').style.display = 'block';
  $('#aiResultLoading').style.display = 'none';
  $('#aiResultContent').style.display = 'none';
  $('#aiResultError').style.display = 'none';
  STATE.aiAnalysisResult = null;
}

// 核心：调用Gemini API分析口腔图像
function handleAiAnalysis() {
  if (!STATE.aiImageData) {
    showToast('请先上传口内照片', 'warning');
    return;
  }
  if (!STATE.aiConfig.apiKey) {
    $('#aiApiConfigCard').style.display = 'block';
    showToast('请先配置AI API Key', 'warning');
    return;
  }

  // 显示加载状态
  $('#aiResultEmpty').style.display = 'none';
  $('#aiResultLoading').style.display = 'block';
  $('#aiResultContent').style.display = 'none';
  $('#aiResultError').style.display = 'none';

  const base64Content = STATE.aiImageData.split(',')[1];
  const mimeType = STATE.aiImageData.match(/data:(image\/\w+);/)?.[1] || 'image/jpeg';

  const prompt = `你是一位经验丰富的口腔全科医生。请仔细分析这张口腔照片，按以下格式输出检查发现：

## 口腔检查报告

### 总体印象
[用1-2句话概括口腔整体状况]

### 检查发现
- 牙列情况：[描述牙列是否完整，有无缺失牙，如有请标注FDI牙位]
- 龋病：[描述有无龋坏，如有请标注位置和严重程度]
- 牙结石/牙菌斑：[描述牙结石分布和程度]
- 牙龈状况：[描述牙龈颜色、形态、有无红肿出血]
- 口腔黏膜：[描述黏膜状况，有无溃疡/白斑/异常]
- 修复体：[描述有无充填物、冠、桥等修复体]
- 其他发现：[其他值得关注的问题]

### 风险评估
[综合评估口腔健康风险等级：低/中/高，并简要说明原因]

### 建议
[给出2-4条具体的进一步检查和治疗建议]

请用专业但通俗的中文表达，适合直接用于电子病历的"口腔检查"字段。对于照片中无法判断的部分，请注明"照片中无法评估"。`;

  const model = STATE.aiConfig.model;
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + STATE.aiConfig.apiKey;

  fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64Content } }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    })
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => { throw err; });
    }
    return res.json();
  })
  .then(data => {
    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    if (!text) throw new Error('API返回为空');
    parseAndDisplayAiResult(text);
  })
  .catch(err => {
    console.error('AI分析失败:', err);
    $('#aiResultLoading').style.display = 'none';
    $('#aiResultError').style.display = 'block';
    let errMsg = '分析失败，请检查网络或API Key';
    if (err.error?.message) errMsg = err.error.message;
    else if (err.message) errMsg = err.message;
    $('#aiErrorMsg').textContent = errMsg;
  });
}

// 解析并展示AI结果
function parseAndDisplayAiResult(rawText) {
  STATE.aiAnalysisResult = {
    rawText: rawText,
    impressions: '',
    findings: [],
    riskLevel: '',
    riskReason: '',
    suggestions: []
  };

  // 解析总体印象
  const impMatch = rawText.match(/总体印象[：:]\s*\n?\s*([^\n]+)/);
  if (impMatch) STATE.aiAnalysisResult.impressions = impMatch[1].trim();

  // 解析检查发现各项
  const findingLabels = {
    '牙列情况': 'normal',
    '龋病': 'abnormal',
    '牙结石': 'critical',
    '牙菌斑': 'critical',
    '牙龈状况': 'abnormal',
    '口腔黏膜': 'normal',
    '修复体': 'normal',
    '其他发现': 'abnormal'
  };

  const findingSection = rawText.match(/检查发现[：:]?\n?([\s\S]*?)(?=###\s*风险|$)/);
  if (findingSection) {
    const sectionText = findingSection[1];
    for (const [label, severity] of Object.entries(findingLabels)) {
      // 匹配 "标签：内容" 或 "- 标签：内容" 或 "标签/内容："
      const patterns = [
        new RegExp('-\\s*' + label + '[：:]([^\\n]+)'),
        new RegExp(label + '[：:]([^\\n]+)'),
        new RegExp('-\\s*' + label + '[/／]' + '[^：:]*[：:]([^\\n]+)')
      ];
      let content = '';
      for (const p of patterns) {
        const m = sectionText.match(p);
        if (m) { content = m[1].trim(); break; }
      }
      if (content) {
        STATE.aiAnalysisResult.findings.push({
          label: label,
          content: content,
          severity: severity,
          icon: severity === 'critical' ? '&#128308;' : (severity === 'abnormal' ? '&#128992;' : '&#128994;')
        });
      }
    }
  }

  // 如果没有解析到结构化发现，直接显示原文
  if (STATE.aiAnalysisResult.findings.length === 0) {
    // 整体作为一条发现
    const cleaned = rawText.replace(/^#{1,4}\s+/gm, '').trim();
    STATE.aiAnalysisResult.findings.push({
      label: 'AI分析结果',
      content: cleaned,
      severity: 'normal',
      icon: '&#129302;'
    });
  }

  // 解析风险评估
  const riskMatch = rawText.match(/风险[等]?级[：:]\s*([^\n]+)/);
  if (riskMatch) STATE.aiAnalysisResult.riskLevel = riskMatch[1].trim();
  const riskReasonMatch = rawText.match(/风险[等]?级.*?\n?([^\n]*(?:原因|说明)[^\n]*)/);
  if (riskReasonMatch) STATE.aiAnalysisResult.riskReason = riskReasonMatch[1].trim();

  // 解析建议
  const suggSection = rawText.match(/建议[：:]?\n?([\s\S]*?)(?=###|$)/);
  if (suggSection) {
    const suggs = suggSection[1].match(/[-•]\s*([^\n]+)/g);
    if (suggs) {
      STATE.aiAnalysisResult.suggestions = suggs.map(s => s.replace(/^[-•]\s*/, '').trim());
    }
  }

  // 显示结果
  displayAiResult();
  saveToAiHistory(rawText);
}

// 显示分析结果
function displayAiResult() {
  if (!STATE.aiAnalysisResult) return;

  $('#aiResultLoading').style.display = 'none';
  $('#aiResultEmpty').style.display = 'none';
  $('#aiResultError').style.display = 'none';
  $('#aiResultContent').style.display = 'block';

  // 原始文本
  $('#aiResultRaw').textContent = STATE.aiAnalysisResult.rawText;

  // 结构化展示
  let structHtml = '';
  const result = STATE.aiAnalysisResult;

  if (result.impressions) {
    structHtml += '<div class="ai-finding-item normal">' +
      '<span class="ai-finding-icon">&#128221;</span>' +
      '<span class="ai-finding-text"><strong>总体印象：</strong>' + result.impressions + '</span>' +
      '</div>';
  }

  result.findings.forEach(f => {
    structHtml += '<div class="ai-finding-item ' + f.severity + '">' +
      '<span class="ai-finding-icon">' + f.icon + '</span>' +
      '<span class="ai-finding-text"><strong>' + f.label + '：</strong>' + f.content + '</span>' +
      '</div>';
  });

  if (result.riskLevel) {
    const riskIcon = result.riskLevel.includes('高') ? '&#128308;' : (result.riskLevel.includes('中') ? '&#128992;' : '&#128994;');
    structHtml += '<div class="ai-finding-item ' +
      (result.riskLevel.includes('高') ? 'critical' : (result.riskLevel.includes('中') ? 'abnormal' : 'normal')) + '">' +
      '<span class="ai-finding-icon">' + riskIcon + '</span>' +
      '<span class="ai-finding-text"><strong>风险评估：</strong>' + result.riskLevel +
      (result.riskReason ? ' —— ' + result.riskReason : '') + '</span>' +
      '</div>';
  }

  if (result.suggestions.length > 0) {
    structHtml += '<div class="ai-finding-item normal">' +
      '<span class="ai-finding-icon">&#128161;</span>' +
      '<span class="ai-finding-text"><strong>建议：</strong><br>' +
      result.suggestions.map((s, i) => (i + 1) + '. ' + s).join('<br>') + '</span>' +
      '</div>';
  }

  $('#aiResultStructured').innerHTML = structHtml;
}

// 保存到历史记录
function saveToAiHistory(rawText) {
  const summary = rawText.match(/总体印象[：:]\s*([^\n]+)/)?.[1] || rawText.substring(0, 80);
  const record = {
    id: 'ai_' + Date.now().toString(36),
    timestamp: new Date().toISOString(),
    thumbnail: STATE.aiImageData,
    summary: summary.substring(0, 80),
    result: STATE.aiAnalysisResult,
    rawText: rawText
  };
  STATE.aiHistory.unshift(record);
  if (STATE.aiHistory.length > 20) STATE.aiHistory = STATE.aiHistory.slice(0, 20);
  saveAiHistory();
  renderAiHistory();
}

// 渲染历史记录
function renderAiHistory() {
  const historyCard = $('#aiHistoryCard');
  const historyList = $('#aiHistoryList');
  if (!historyCard || !historyList) return;

  if (STATE.aiHistory.length === 0) {
    historyCard.style.display = 'none';
    return;
  }

  historyCard.style.display = 'block';
  let html = '';
  STATE.aiHistory.forEach(item => {
    html += '<div class="ai-history-item" onclick="app.viewAiHistoryItem(\'' + item.id + '\')">' +
      '<img class="ai-history-thumb" src="' + (item.thumbnail || '') + '" alt="缩略图" onerror="this.style.display=\'none\'">' +
      '<div class="ai-history-info">' +
      '<div class="ai-history-date">' + formatDate(item.timestamp) + '</div>' +
      '<div class="ai-history-summary">' + item.summary + '</div>' +
      '</div>' +
      '<button class="ai-history-delete" onclick="event.stopPropagation(); app.deleteAiHistoryItem(\'' + item.id + '\')" title="删除">&#10005;</button>' +
      '</div>';
  });
  historyList.innerHTML = html;
}

// 查看历史记录详情
function viewAiHistoryItem(id) {
  const item = STATE.aiHistory.find(h => h.id === id);
  if (!item) return;

  if (item.thumbnail) {
    STATE.aiImageData = item.thumbnail;
    $('#aiPreviewImg').src = item.thumbnail;
    $('#aiUploadPrompt').style.display = 'none';
    $('#aiImagePreview').style.display = 'block';
    $('#aiUploadActions').style.display = 'block';
  }

  STATE.aiAnalysisResult = item.result;
  displayAiResult();

  // 滚动到结果区
  $('#aiResultContent').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 删除历史记录项
function deleteAiHistoryItem(id) {
  STATE.aiHistory = STATE.aiHistory.filter(h => h.id !== id);
  saveAiHistory();
  renderAiHistory();
  showToast('记录已删除', 'info');
}

// 清空历史
function clearAiHistory() {
  if (!confirm('确定清空所有AI检查历史吗？')) return;
  STATE.aiHistory = [];
  saveAiHistory();
  renderAiHistory();
  showToast('历史记录已清空', 'info');
}

// 一键填入病例表单
function fillResultToRecord() {
  if (!STATE.aiAnalysisResult) return;

  // 构建口腔检查文本
  const lines = [];
  if (STATE.aiAnalysisResult.impressions) {
    lines.push('AI辅助检查 - 总体印象：' + STATE.aiAnalysisResult.impressions);
  }
  STATE.aiAnalysisResult.findings.forEach(f => {
    lines.push(f.label + '：' + f.content);
  });
  if (STATE.aiAnalysisResult.riskLevel) {
    lines.push('风险评估：' + STATE.aiAnalysisResult.riskLevel + (STATE.aiAnalysisResult.riskReason ? '（' + STATE.aiAnalysisResult.riskReason + '）' : ''));
  }
  if (STATE.aiAnalysisResult.suggestions.length > 0) {
    lines.push('AI建议：' + STATE.aiAnalysisResult.suggestions.join('；'));
  }
  lines.push('');
  lines.push('（以上为AI辅助分析结果，请结合临床检查确认）');

  // 填入"口腔检查"字段
  const examEl = $('#oralExam');
  const existing = examEl.value.trim();
  examEl.value = existing ? existing + '\n\n---\n\n' + lines.join('\n') : lines.join('\n');

  // 自动导航到新增病例页面
  navigateTo('newRecord');
  showToast('AI检查结果已填入口腔检查字段，请补充完整后保存', 'success');
}

// 复制结果到剪贴板
function copyAiResult() {
  if (!STATE.aiAnalysisResult) return;
  const text = STATE.aiAnalysisResult.rawText;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('已复制到剪贴板', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); showToast('已复制到剪贴板', 'success'); }
  catch(e) { showToast('复制失败，请手动选择文本', 'error'); }
  document.body.removeChild(ta);
}

// 重新分析（清除结果，可重新上传图片）
function resetAiExam() {
  removeAiImage();
  resetAiResult();
}

function populateConsentFormSelect() {
  const select = $('#consentFormSelect');
  select.innerHTML = '<option value="">暂不需要</option>';
  CONSENT_FORM_TEMPLATES.forEach(tpl => {
    select.innerHTML += '<option value="' + tpl.id + '">' + tpl.name + '</option>';
  });

  select.addEventListener('change', function() {
    const preview = $('#consentPreview');
    const content = $('#consentPreviewContent');
    if (this.value) {
      const tpl = CONSENT_FORM_TEMPLATES.find(t => t.id === this.value);
      if (tpl) {
        content.textContent = fillConsentForm(tpl.content);
        preview.style.display = 'block';
      }
    } else {
      preview.style.display = 'none';
    }
  });
}

// 自动填入患者信息到知情同意书
function fillConsentForm(template) {
  const now = new Date();
  const dateStr = now.getFullYear() + '年' + (now.getMonth()+1) + '月' + now.getDate() + '日';
  const name = $('#patientName').value.trim() || '________________';
  const gender = $('#patientGender').value || '______';
  const age = $('#patientAge').value || '______';
  const phone = $('#patientPhone').value || '________________';
  const idCard = $('#patientIdCard').value || '________________';
  const diagnosis = $('#diagnosis').value.trim() || '________________';
  const teeth = STATE.selectedTeeth.length > 0 ? STATE.selectedTeeth.join('、') : '________________';

  let filled = template;
  // 患者基本信息
  filled = filled.replace(/患者姓名[：:]\s*_{3,}/, '患者姓名：' + name);
  filled = filled.replace(/患者姓名[：:]\s*[^\n]*/, function(m) {
    // 确保保留签名行（在后面的空白行）
    return m.replace(/(_{3,}|[　\s]*$)/, name + '  ');
  }).replace(/(_{3,})/g, function(m, p1, offset) {
    // 智能替换：找到对应位置的信息
    return m;
  });

  // 更精确的替换
  filled = replaceConsentField(filled, '患者姓名', name);
  filled = replaceConsentField(filled, '性别', gender);
  filled = replaceConsentField(filled, '年龄', age);
  filled = replaceConsentField(filled, '联系电话', phone);
  filled = replaceConsentField(filled, '身份证号', idCard);
  filled = replaceConsentField(filled, '诊断', diagnosis);
  filled = replaceConsentField(filled, '牙位', teeth);
  filled = replaceConsentField(filled, '拟行手术', (getSelectedTreatments().length > 0 ? getSelectedTreatments().join('、') : '________________'));
  filled = replaceConsentField(filled, '拟行治疗', (getSelectedTreatments().length > 0 ? getSelectedTreatments().join('、') : '________________'));
  filled = replaceConsentField(filled, '拟行矫治方案', '________________');
  filled = replaceConsentField(filled, '拟行修复方式', '________________');
  filled = replaceConsentField(filled, '拟行修复方案', '________________');
  filled = replaceConsentField(filled, '充填材料', '________________');
  filled = replaceConsentField(filled, '修复材料', '________________');
  filled = replaceConsentField(filled, '麻醉方式', '________________');

  // 日期自动填入
  filled = filled.replace(/日期[：:]\s*_{3,}[年]\s*_{3,}[月]\s*_{3,}[日]/g, '日期：' + dateStr);
  filled = filled.replace(/日期[：:]\s*_{3,}/g, '日期：' + dateStr);

  // 医生签名自动填入，患者签名保留空白
  filled = filled.replace(/医生签名[：:]\s*_{3,}/g, '医生签名：郑博');
  // 保留患者签名行空白
  filled = filled.replace(/患者[（(]或监护人[）)]签名[：:]\s*_{3,}/g, '患者（或监护人）签名：________________');

  return filled;
}

function replaceConsentField(text, label, value) {
  if (value === '______' || value === '________________') return text;
  const patterns = [
    new RegExp(label + '[：:]\\s*_{3,}', 'g'),
    new RegExp(label + '[：:]\\s*_{2,}', 'g')
  ];
  for (const p of patterns) {
    text = text.replace(p, label + '：' + value);
  }
  return text;
}

function renderConsentForms() {
  const grid = $('#consentTemplatesGrid');
  let html = '';
  CONSENT_FORM_TEMPLATES.forEach(tpl => {
    html += '<div class="consent-template-card" onclick="app.previewConsentForm(\'' + tpl.id + '\')">';
    html += '<h4>' + tpl.name + '</h4>';
    html += '<p>分类：' + tpl.category + ' | 点击预览完整内容</p>';
    html += '</div>';
  });
  grid.innerHTML = html;
}

function previewConsentForm(templateId) {
  const tpl = CONSENT_FORM_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;

  const modal = $('#recordDetailModal');
  const content = $('#recordDetailContent');
  content.innerHTML = '<div class="detail-section"><h4>' + tpl.name + '</h4>' +
    '<div class="consent-preview-content" style="max-height:none;">' + tpl.content.replace(/\n/g, '<br>') + '</div></div>';
  
  // 修改modal footer 为知情同意书专用按钮
  const footer = modal.querySelector('.modal-footer');
  footer.innerHTML = '<button class="btn btn-outline" onclick="app.printConsentForm(\'' + templateId + '\')">打印知情同意书</button>' +
    '<button class="btn btn-primary" onclick="app.closeModal(\'recordDetailModal\')">关闭</button>';

  modal.classList.add('active');
}

function printConsentForm(templateId) {
  const tpl = CONSENT_FORM_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write('<html><head><meta charset="UTF-8"><title>' + tpl.name + '</title>');
  printWindow.document.write('<style>body{font-family:SimSun,serif;font-size:14px;line-height:2;padding:40px;max-width:700px;margin:0 auto;}h2{text-align:center;margin-bottom:30px;}</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write('<h2>' + tpl.name + '</h2>');
  printWindow.document.write(tpl.content.replace(/\n/g, '<br>'));
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
}

// ==================== 病例CRUD ====================
function saveRecord(e) {
  e.preventDefault();

  const patientName = $('#patientName').value.trim();
  const gender = $('#patientGender').value;
  const chiefComplaint = $('#chiefComplaint').value.trim();
  const diagnosis = $('#diagnosis').value.trim();

  if (!patientName || !gender || !chiefComplaint || !diagnosis) {
    showToast('请填写必填项（患者姓名、性别、主诉、诊断）', 'warning');
    return;
  }

  const record = {
    id: STATE.currentRecordId || generateId(),
    patientName: patientName,
    gender: gender,
    age: $('#patientAge').value || '',
    phone: $('#patientPhone').value || '',
    idCard: $('#patientIdCard').value || '',
    address: $('#patientAddress').value || '',
    teeth: [...STATE.selectedTeeth],
    toothConditions: {...STATE.toothConditions},
    chiefComplaint: chiefComplaint,
    presentIllness: $('#presentIllness').value || '',
    diagnosis: diagnosis,
    treatmentType: getSelectedTreatments().join('、') || '',
    oralExam: $('#oralExam').value || '',
    treatmentPlan: $('#treatmentPlan').value || '',
    doctorAdvice: $('#doctorAdvice').value || '',
    notes: $('#recordNotes').value || '',
    consentFormType: $('#consentFormSelect').value || '',
    consentSigned: $('#consentAgreed').checked,
    doctorId: 'doctor-1',
    doctorName: '郑博',
    followUps: STATE.currentRecordId
      ? (STATE.records.find(r => r.id === STATE.currentRecordId)?.followUps || [])
      : [],
    createdAt: STATE.currentRecordId 
      ? (STATE.records.find(r => r.id === STATE.currentRecordId)?.createdAt || new Date().toISOString())
      : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 保存或更新
  const existingIdx = STATE.records.findIndex(r => r.id === record.id);
  if (existingIdx >= 0) {
    STATE.records[existingIdx] = record;
    showToast('病例更新成功', 'success');
  } else {
    STATE.records.unshift(record);
    showToast('病例保存成功', 'success');
  }

  // 更新患者列表
  updatePatientList(record);

  saveLocalData();
  resetRecordForm();
  navigateTo('dashboard');

  // 自动同步到GitHub
  autoSyncToGitHub();
}

function updatePatientList(record) {
  const existingPatient = STATE.patients.find(p => 
    p.name === record.patientName && p.phone === record.phone
  );
  
  if (existingPatient) {
    existingPatient.lastVisit = record.updatedAt;
    existingPatient.recordCount = STATE.records.filter(r => 
      r.patientName === record.patientName && r.phone === record.phone
    ).length;
  } else {
    STATE.patients.push({
      id: generateId(),
      name: record.patientName,
      gender: record.gender,
      age: record.age,
      phone: record.phone,
      lastVisit: record.updatedAt,
      recordCount: 1
    });
  }
}

function resetRecordForm() {
  STATE.currentRecordId = null;
  STATE.selectedTeeth = [];
  STATE.toothConditions = {};
  toothType = 'permanent';
  $('#btnPermanent').classList.add('active');
  $('#btnPrimary').classList.remove('active');
  $('#recordForm').reset();
  document.querySelectorAll('input[name="treatmentType"]').forEach(cb => cb.checked = false);
  $('#consentPreview').style.display = 'none';
  renderToothChart();
}

function editRecord(recordId) {
  const record = STATE.records.find(r => r.id === recordId);
  if (!record) return;

  STATE.currentRecordId = recordId;
  STATE.selectedTeeth = [...record.teeth];
  STATE.toothConditions = record.toothConditions ? {...record.toothConditions} : {};

  $('#patientName').value = record.patientName;
  $('#patientGender').value = record.gender;
  $('#patientAge').value = record.age;
  $('#patientPhone').value = record.phone;
  $('#patientIdCard').value = record.idCard;
  $('#patientAddress').value = record.address;
  $('#chiefComplaint').value = record.chiefComplaint;
  $('#presentIllness').value = record.presentIllness;
  $('#diagnosis').value = record.diagnosis;
  setSelectedTreatments(record.treatmentType);
  $('#oralExam').value = record.oralExam || '';
  $('#treatmentPlan').value = record.treatmentPlan;
  $('#doctorAdvice').value = record.doctorAdvice;
  $('#recordNotes').value = record.notes;
  $('#consentFormSelect').value = record.consentFormType;
  $('#consentAgreed').checked = record.consentSigned;

  if (record.consentFormType) {
    const tpl = CONSENT_FORM_TEMPLATES.find(t => t.id === record.consentFormType);
    if (tpl) {
      $('#consentPreviewContent').textContent = fillConsentForm(tpl.content);
      $('#consentPreview').style.display = 'block';
    }
  }

  renderToothChart();
  navigateTo('newRecord');
  showToast('正在编辑病例：' + record.patientName, 'info');
}

function viewRecord(recordId) {
  const record = STATE.records.find(r => r.id === recordId);
  if (!record) return;

  STATE.currentRecord = record;
  STATE.currentRecordId = recordId;

  const content = $('#recordDetailContent');
  const teethLabels = record.teeth.length > 0 ? record.teeth.join('、') : '未选择';
  const condStr = buildConditionSummary(record);

  content.innerHTML = 
    '<div class="record-detail">' +
      '<div class="detail-section"><h4>患者信息</h4>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">姓名</span><span class="detail-value">' + record.patientName + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">性别</span><span class="detail-value">' + record.gender + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">年龄</span><span class="detail-value">' + (record.age || '未填写') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">电话</span><span class="detail-value">' + (record.phone || '未填写') + '</span></div>' +
          '<div class="detail-item detail-full"><span class="detail-label">身份证</span><span class="detail-value">' + (record.idCard || '未填写') + '</span></div>' +
          '<div class="detail-item detail-full"><span class="detail-label">地址</span><span class="detail-value">' + (record.address || '未填写') + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="detail-section"><h4>诊疗信息</h4>' +
        '<div class="detail-grid">' +
          '<div class="detail-item detail-full"><span class="detail-label">牙位</span><span class="detail-value">' + teethLabels + '</span></div>' +
          (condStr ? '<div class="detail-item detail-full"><span class="detail-label">牙位标记</span><span class="detail-value" style="color:var(--danger)">' + condStr + '</span></div>' : '') +
          '<div class="detail-item detail-full"><span class="detail-label">主诉</span><span class="detail-value">' + record.chiefComplaint + '</span></div>' +
          '<div class="detail-item detail-full"><span class="detail-label">诊断</span><span class="detail-value">' + record.diagnosis + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">治疗类型</span><span class="detail-value">' + (record.treatmentType || '未选择') + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">知情同意书</span><span class="detail-value">' + (record.consentFormType ? '已签署' : '无') + '</span></div>' +
        '</div>' +
      '</div>' +
      (record.presentIllness ? '<div class="detail-section"><h4>现病史</h4><p style="font-size:14px;">' + record.presentIllness + '</p></div>' : '') +
      (record.oralExam ? '<div class="detail-section"><h4>口腔检查</h4><p style="font-size:14px;white-space:pre-line;">' + record.oralExam + '</p></div>' : '') +
      (record.treatmentPlan ? '<div class="detail-section"><h4>治疗方案</h4><p style="font-size:14px;">' + record.treatmentPlan + '</p></div>' : '') +
      (record.doctorAdvice ? '<div class="detail-section"><h4>医嘱</h4><p style="font-size:14px;">' + record.doctorAdvice + '</p></div>' : '') +
      (record.notes ? '<div class="detail-section"><h4>备注</h4><p style="font-size:14px;">' + record.notes + '</p></div>' : '') +
      buildFollowUpSection(record) +
      '<div class="detail-section"><h4>记录信息</h4>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><span class="detail-label">医生</span><span class="detail-value">' + record.doctorName + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">创建时间</span><span class="detail-value">' + formatDate(record.createdAt) + '</span></div>' +
          '<div class="detail-item"><span class="detail-label">更新时间</span><span class="detail-value">' + formatDate(record.updatedAt) + '</span></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // 恢复modal footer
  const footer = $('#recordDetailModal').querySelector('.modal-footer');
  footer.innerHTML = '<button class="btn btn-outline" onclick="app.printRecord()">打印病例</button>' +
    '<button class="btn btn-outline" onclick="app.exportRecordJSON()">导出JSON</button>' +
    '<button class="btn btn-outline" onclick="app.editRecord(\'' + recordId + '\'); app.closeModal(\'recordDetailModal\')">编辑</button>' +
    '<button class="btn btn-success" onclick="app.openFollowUpModal(\'' + recordId + '\')">+ 添加复诊</button>' +
    '<button class="btn btn-danger" onclick="app.deleteRecord()">删除</button>' +
    '<button class="btn btn-primary" onclick="app.closeModal(\'recordDetailModal\')">关闭</button>';

  $('#recordDetailModal').classList.add('active');
}

// 构建复诊记录区块
function buildFollowUpSection(record) {
  const followUps = record.followUps || [];
  if (followUps.length === 0) {
    return '<div class="detail-section"><h4>复诊记录 <span class="fu-count">0</span></h4>' +
      '<p style="font-size:13px;color:var(--gray-400);">暂无复诊记录，点击底部"添加复诊"登记</p></div>';
  }

  // 按日期排序（最近在前）
  const sorted = [...followUps].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  let html = '<div class="detail-section"><h4>复诊记录 <span class="fu-count">' + followUps.length + '</span></h4>';
  html += '<div class="fu-list">';

  sorted.forEach(fu => {
    html += '<div class="fu-item">';
    html += '<div class="fu-item-header">';
    html += '<span class="fu-date">&#128197; ' + (fu.date || '未填日期') + '</span>';
    html += '<div class="fu-item-actions">';
    html += '<button class="fu-btn" onclick="app.openFollowUpModal(\'' + record.id + '\',\'' + fu.id + '\')">编辑</button>';
    html += '<button class="fu-btn fu-btn-danger" onclick="app.deleteFollowUp(\'' + record.id + '\',\'' + fu.id + '\')">删除</button>';
    html += '</div>';
    html += '</div>';
    if (fu.chiefComplaint) html += '<div class="fu-row"><span class="fu-label">主诉</span><span class="fu-val">' + fu.chiefComplaint + '</span></div>';
    if (fu.operation) html += '<div class="fu-row"><span class="fu-label">操作</span><span class="fu-val">' + fu.operation + '</span></div>';
    if (fu.diagnosis) html += '<div class="fu-row"><span class="fu-label">诊断</span><span class="fu-val">' + fu.diagnosis + '</span></div>';
    if (fu.oralExam) html += '<div class="fu-row"><span class="fu-label">口腔检查</span><span class="fu-val">' + fu.oralExam + '</span></div>';
    if (fu.doctorAdvice) html += '<div class="fu-row"><span class="fu-label">医嘱</span><span class="fu-val">' + fu.doctorAdvice + '</span></div>';
    if (fu.notes) html += '<div class="fu-row"><span class="fu-label">备注</span><span class="fu-val">' + fu.notes + '</span></div>';
    html += '</div>';
  });

  html += '</div></div>';
  return html;
}

// 打开复诊弹窗（新增或编辑）
function openFollowUpModal(recordId, followUpId) {
  $('#fuRecordId').value = recordId;
  $('#fuId').value = followUpId || '';

  const today = new Date().toISOString().split('T')[0];

  if (followUpId) {
    // 编辑模式
    const record = STATE.records.find(r => r.id === recordId);
    const fu = record?.followUps?.find(f => f.id === followUpId);
    $('#followUpModalTitle').textContent = '编辑复诊';
    $('#fuDate').value = fu?.date || today;
    $('#fuOperation').value = fu?.operation || '';
    $('#fuChiefComplaint').value = fu?.chiefComplaint || '';
    $('#fuDiagnosis').value = fu?.diagnosis || '';
    $('#fuOralExam').value = fu?.oralExam || '';
    $('#fuDoctorAdvice').value = fu?.doctorAdvice || '';
    $('#fuNotes').value = fu?.notes || '';
  } else {
    // 新增模式
    $('#followUpModalTitle').textContent = '添加复诊';
    $('#fuDate').value = today;
    $('#fuOperation').value = '';
    $('#fuChiefComplaint').value = '';
    $('#fuDiagnosis').value = '';
    $('#fuOralExam').value = '';
    $('#fuDoctorAdvice').value = '';
    $('#fuNotes').value = '';
  }

  $('#followUpModal').classList.add('active');
}

// 保存复诊
function saveFollowUp() {
  const recordId = $('#fuRecordId').value;
  const followUpId = $('#fuId').value;
  const date = $('#fuDate').value;

  if (!date) {
    showToast('请选择复诊日期', 'warning');
    return;
  }

  const record = STATE.records.find(r => r.id === recordId);
  if (!record) return;
  if (!record.followUps) record.followUps = [];

  const fuData = {
    id: followUpId || 'fu_' + Date.now().toString(36),
    date: date,
    operation: $('#fuOperation').value.trim(),
    chiefComplaint: $('#fuChiefComplaint').value.trim(),
    diagnosis: $('#fuDiagnosis').value.trim(),
    oralExam: $('#fuOralExam').value.trim(),
    doctorAdvice: $('#fuDoctorAdvice').value.trim(),
    notes: $('#fuNotes').value.trim(),
    createdAt: new Date().toISOString()
  };

  if (followUpId) {
    const idx = record.followUps.findIndex(f => f.id === followUpId);
    if (idx >= 0) record.followUps[idx] = { ...record.followUps[idx], ...fuData };
    showToast('复诊记录已更新', 'success');
  } else {
    record.followUps.push(fuData);
    showToast('复诊记录已添加', 'success');
  }

  record.updatedAt = new Date().toISOString();
  refreshPatientVisit(record);
  saveLocalData();
  closeModal('followUpModal');
  viewRecord(recordId);
  autoSyncToGitHub();
}

// 删除复诊
function deleteFollowUp(recordId, followUpId) {
  if (!confirm('确定删除这条复诊记录吗？')) return;
  const record = STATE.records.find(r => r.id === recordId);
  if (!record || !record.followUps) return;
  record.followUps = record.followUps.filter(f => f.id !== followUpId);
  record.updatedAt = new Date().toISOString();
  refreshPatientVisit(record);
  saveLocalData();
  viewRecord(recordId);
  showToast('复诊记录已删除', 'warning');
  autoSyncToGitHub();
}

// 更新患者最近就诊日期（取该患者的主记录与所有复诊的最晚日期）
function refreshPatientVisit(record) {
  const records = STATE.records.filter(r => r.patientName === record.patientName && r.phone === record.phone);
  let latest = record.createdAt || new Date().toISOString();
  records.forEach(r => {
    if (r.createdAt > latest) latest = r.createdAt;
    (r.followUps || []).forEach(fu => {
      const fuIso = fu.date ? new Date(fu.date).toISOString() : '';
      if (fuIso && fuIso > latest) latest = fuIso;
    });
  });
  const patient = STATE.patients.find(p => p.name === record.patientName && p.phone === record.phone);
  if (patient) patient.lastVisit = latest;
}

function deleteRecord() {
  if (!STATE.currentRecordId) return;
  if (!confirm('确定要删除该病例记录吗？此操作不可恢复！')) return;

  const record = STATE.records.find(r => r.id === STATE.currentRecordId);
  STATE.records = STATE.records.filter(r => r.id !== STATE.currentRecordId);
  
  // 更新患者计数
  if (record) {
    const patient = STATE.patients.find(p => p.name === record.patientName && p.phone === record.phone);
    if (patient) {
      patient.recordCount = STATE.records.filter(r => 
        r.patientName === record.patientName && r.phone === record.phone
      ).length;
      if (patient.recordCount === 0) {
        STATE.patients = STATE.patients.filter(p => p.id !== patient.id);
      }
    }
  }

  saveLocalData();
  closeModal('recordDetailModal');
  renderDashboard();
  showToast('病例已删除', 'warning');
  autoSyncToGitHub();
}

function printRecord() {
  if (!STATE.currentRecord) return;
  window.print();
}

function exportRecordJSON() {
  if (!STATE.currentRecord) return;
  const blob = new Blob([JSON.stringify(STATE.currentRecord, null, 2)], { type: 'application/json' });
  downloadBlob(blob, '病例_' + STATE.currentRecord.patientName + '_' + formatDateShort(STATE.currentRecord.createdAt) + '.json');
}

// ==================== 页面渲染 ====================
function renderDashboard() {
  $('#statTotalPatients').textContent = STATE.patients.length;
  $('#statTotalRecords').textContent = STATE.records.length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = STATE.records.filter(r => r.createdAt.startsWith(today));
  $('#statTodayRecords').textContent = todayRecords.length;
  
  const consentCount = STATE.records.filter(r => r.consentFormType).length;
  $('#statConsentForms').textContent = consentCount;

  // 最近病例
  const recent = STATE.records.slice(0, 10);
  const recentEl = $('#recentRecords');
  if (recent.length === 0) {
    recentEl.innerHTML = '<div class="empty-state">暂无病例记录，点击"新增病例"开始登记</div>';
  } else {
    let html = '';
    recent.forEach(r => {
      html += '<div class="record-list-item" onclick="app.viewRecord(\'' + r.id + '\')">';
      html += '<div class="record-list-info">';
      html += '<span class="record-list-name">' + r.patientName + '</span>';
      const condSummary = buildConditionSummary(r);
      html += '<span class="record-list-detail">' + r.diagnosis + ' | ' + (r.treatmentType || '未分类') + (condSummary ? ' | ' + condSummary : '') + '</span>';
      html += '</div>';
      html += '<span class="record-list-date">' + formatDateShort(r.createdAt) + '</span>';
      html += '</div>';
    });
    recentEl.innerHTML = html;
  }

  updateTime();
}

function renderPatientList() {
  const tbody = $('#patientTableBody');
  const searchTerm = ($('#patientSearch')?.value || '').toLowerCase();
  
  let filtered = STATE.patients;
  if (searchTerm) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchTerm) || 
      p.phone.includes(searchTerm)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">暂无患者数据</td></tr>';
    return;
  }

  let html = '';
  filtered.forEach(p => {
    html += '<tr>';
    html += '<td><strong>' + p.name + '</strong></td>';
    html += '<td>' + p.gender + '</td>';
    html += '<td>' + (p.age || '-') + '</td>';
    html += '<td>' + (p.phone || '-') + '</td>';
    html += '<td>' + formatDateShort(p.lastVisit) + '</td>';
    html += '<td>' + p.recordCount + '</td>';
    html += '<td class="action-btns">';
    html += '<button class="btn btn-outline btn-sm" onclick="app.showPatientRecords(\'' + p.name + '\',\'' + (p.phone||'') + '\')">查看病例</button>';
    html += '</td>';
    html += '</tr>';
  });
  tbody.innerHTML = html;
}

function showPatientRecords(name, phone) {
  const records = STATE.records.filter(r => r.patientName === name && r.phone === phone);
  if (records.length === 0) {
    showToast('该患者暂无病例记录', 'info');
    return;
  }

  const modal = $('#recordDetailModal');
  const content = $('#recordDetailContent');
  
  let html = '<div class="detail-section"><h4>' + name + ' - 病史汇总（共' + records.length + '条）</h4></div>';
  records.forEach(r => {
    html += '<div class="record-list-item" onclick="app.viewRecord(\'' + r.id + '\');" style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin-bottom:8px;">';
    html += '<div class="record-list-info">';
    html += '<span class="record-list-name">' + r.diagnosis + '</span>';
    const condSum = buildConditionSummary(r);
    html += '<span class="record-list-detail">' + (r.treatmentType || '') + ' | 牙位：' + (r.teeth.length > 0 ? r.teeth.join('、') : '未选择') + (condSum ? ' | ' + condSum : '') + '</span>';
    html += '</div>';
    html += '<span class="record-list-date">' + formatDateShort(r.createdAt) + '</span>';
    html += '</div>';
  });

  content.innerHTML = html;
  
  const footer = modal.querySelector('.modal-footer');
  footer.innerHTML = '<button class="btn btn-primary" onclick="app.closeModal(\'recordDetailModal\')">关闭</button>';
  
  modal.classList.add('active');
}

function renderNewRecordForm() {
  STATE.currentRecordId = null;
  STATE.selectedTeeth = [];
  STATE.toothConditions = {};
  toothType = 'permanent';
  $('#btnPermanent').classList.add('active');
  $('#btnPrimary').classList.remove('active');
  $('#recordForm').reset();
  document.querySelectorAll('input[name="treatmentType"]').forEach(cb => cb.checked = false);
  $('#consentPreview').style.display = 'none';
  renderToothChart();
}

// ==================== 时间更新 ====================
function updateTime() {
  const now = new Date();
  const str = now.getFullYear() + '-' + 
    String(now.getMonth()+1).padStart(2,'0') + '-' + 
    String(now.getDate()).padStart(2,'0') + ' ' +
    String(now.getHours()).padStart(2,'0') + ':' +
    String(now.getMinutes()).padStart(2,'0') + ':' +
    String(now.getSeconds()).padStart(2,'0');
  const el = $('#currentTime');
  if (el) el.textContent = str;
}

// ==================== Modal ====================
function closeModal(modalId) {
  $(`#${modalId}`).classList.remove('active');
  if (modalId === 'recordDetailModal') {
    STATE.currentRecord = null;
    STATE.currentRecordId = null;
  }
}

// ==================== GitHub 同步 ====================
function saveGitHubConfigFromForm() {
  STATE.githubConfig.username = $('#githubUsername').value.trim();
  STATE.githubConfig.repo = $('#githubRepo').value.trim();
  STATE.githubConfig.token = $('#githubToken').value.trim();
  saveGitHubConfig();
  showToast('GitHub配置已保存', 'success');
}

function testGitHubConnection() {
  const config = {
    username: $('#githubUsername').value.trim(),
    repo: $('#githubRepo').value.trim(),
    token: $('#githubToken').value.trim()
  };

  if (!config.username || !config.repo || !config.token) {
    showToast('请填写完整的GitHub配置信息', 'warning');
    return;
  }

  updateSyncStatus('syncing', '测试连接中...');
  
  fetch('https://api.github.com/repos/' + config.username + '/' + config.repo, {
    headers: { 'Authorization': 'token ' + config.token, 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(res => {
    if (res.ok) {
      showToast('GitHub连接成功！仓库可正常访问', 'success');
      updateSyncStatus('success', '连接成功');
    } else if (res.status === 404) {
      showToast('仓库不存在，请在GitHub上创建仓库：' + config.repo, 'warning');
      updateSyncStatus('error', '仓库不存在');
    } else {
      showToast('连接失败 (HTTP ' + res.status + ')，请检查Token权限', 'error');
      updateSyncStatus('error', '连接失败');
    }
  })
  .catch(err => {
    showToast('网络错误或Token无效：' + err.message, 'error');
    updateSyncStatus('error', '网络错误');
  });
}

function syncToGitHub() {
  const config = STATE.githubConfig;
  if (!config.username || !config.repo || !config.token) {
    showToast('请先在设置中配置GitHub信息', 'warning');
    navigateTo('settings');
    return;
  }

  updateSyncStatus('syncing', '同步中...');

  const data = {
    patients: STATE.patients,
    records: STATE.records,
    consentForms: STATE.consentForms,
    lastSync: new Date().toISOString(),
    doctor: STATE.currentUser
  };

  const content = JSON.stringify(data, null, 2);
  const base64 = btoa(unescape(encodeURIComponent(content)));
  const path = 'dental-data.json';

  // 先尝试获取文件SHA
  fetch('https://api.github.com/repos/' + config.username + '/' + config.repo + '/contents/' + path, {
    headers: { 'Authorization': 'token ' + config.token, 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(res => res.ok ? res.json() : Promise.resolve(null))
  .then(fileInfo => {
    const body = {
      message: 'Update dental records - ' + new Date().toISOString(),
      content: base64,
      branch: 'main'
    };
    if (fileInfo && fileInfo.sha) {
      body.sha = fileInfo.sha;
    }

    return fetch('https://api.github.com/repos/' + config.username + '/' + config.repo + '/contents/' + path, {
      method: 'PUT',
      headers: { 'Authorization': 'token ' + config.token, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  })
  .then(res => {
    if (res.ok) {
      showToast('数据已同步到GitHub', 'success');
      updateSyncStatus('success', '已同步');
    } else {
      return res.json().then(err => { throw err; });
    }
  })
  .catch(err => {
    console.error('同步失败:', err);
    showToast('同步失败：' + (err.message || '未知错误'), 'error');
    updateSyncStatus('error', '同步失败');
  });
}

function pullFromGitHub() {
  const config = STATE.githubConfig;
  if (!config.username || !config.repo || !config.token) {
    showToast('请先在设置中配置GitHub信息', 'warning');
    return;
  }

  updateSyncStatus('syncing', '拉取中...');

  fetch('https://api.github.com/repos/' + config.username + '/' + config.repo + '/contents/dental-data.json', {
    headers: { 'Authorization': 'token ' + config.token, 'Accept': 'application/vnd.github.v3+json' }
  })
  .then(res => res.json())
  .then(fileInfo => {
    if (fileInfo.content) {
      const content = JSON.parse(decodeURIComponent(escape(atob(fileInfo.content.replace(/\s/g, '')))));
      const before = STATE.records.length;
      STATE.patients = mergeById(STATE.patients, content.patients);
      STATE.records = mergeById(STATE.records, content.records);
      STATE.consentForms = mergeById(STATE.consentForms, content.consentForms);
      rebuildPatientsFromRecords();
      saveLocalData();
      renderDashboard();
      const net = STATE.records.length - before;
      showToast('数据已从GitHub合并成功，共 ' + STATE.records.length + ' 条' + (net > 0 ? '（新增 ' + net + ' 条）' : ''), 'success');
      updateSyncStatus('success', '已同步');
    }
  })
  .catch(err => {
    showToast('拉取失败：' + err.message, 'error');
    updateSyncStatus('error', '拉取失败');
  });
}

function autoSyncToGitHub() {
  const config = STATE.githubConfig;
  if (config.username && config.repo && config.token) {
    syncToGitHub();
  }
}

function updateSyncStatus(status, text) {
  const dot = document.querySelector('.sync-dot');
  const textEl = document.querySelector('.sync-text');
  if (dot) {
    dot.className = 'sync-dot ' + status;
  }
  if (textEl) {
    textEl.textContent = text;
  }
}

// ==================== 数据导出/导入 ====================
function exportAllData() {
  const data = {
    exportTime: new Date().toISOString(),
    version: '1.0',
    doctor: STATE.currentUser,
    totalPatients: STATE.patients.length,
    totalRecords: STATE.records.length,
    patients: STATE.patients,
    records: STATE.records,
    consentForms: STATE.consentForms
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, '向阳口腔病例数据_' + formatDateShort(new Date().toISOString()) + '.json');
  showToast('数据导出成功', 'success');
}

function showImportDialog() {
  $('#importModal').classList.add('active');
}

function clearLocalData() {
  if (!confirm('确定要清除所有本地数据吗？此操作不可恢复！\n\n建议先导出数据备份。')) return;
  if (!confirm('再次确认：清除后数据将无法恢复！')) return;

  STATE.patients = [];
  STATE.records = [];
  STATE.consentForms = [];
  saveLocalData();
  renderDashboard();
  renderPatientList();
  showToast('本地数据已清除', 'warning');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== 初始化 ====================
function initApp() {
  loadLocalData();
  loadGitHubConfig();
  populateConsentFormSelect();
  
  // 绑定事件
  $('#loginForm').addEventListener('submit', handleLogin);
  $('#recordForm').addEventListener('submit', saveRecord);
  $('#btnLogout').addEventListener('click', handleLogout);
  $('#btnResetForm').addEventListener('click', () => { resetRecordForm(); renderToothChart(); });
  $('#btnCancelRecord').addEventListener('click', () => { resetRecordForm(); navigateTo('dashboard'); });
  
  // 导航事件
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      navigateTo(this.dataset.page);
    });
  });

  // 快速链接
  $$('[data-page]').forEach(el => {
    if (!el.classList.contains('nav-item')) {
      el.addEventListener('click', function() {
        navigateTo(this.dataset.page);
      });
    }
  });

  // 牙位类型切换
  $('#btnPermanent').addEventListener('click', () => switchToothType('permanent'));
  $('#btnPrimary').addEventListener('click', () => switchToothType('primary'));

  // 条件标记工具栏
  document.querySelectorAll('.cond-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      setConditionMode(this.dataset.cond);
    });
  });

  // 治疗类型勾选 → 自动追加到治疗方案
  document.querySelectorAll('input[name="treatmentType"]').forEach(cb => {
    cb.addEventListener('change', syncTreatmentsToPlan);
  });

  // 移动端菜单
  $('#mobileMenuBtn').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
  });

  // 搜索
  const searchInput = $('#patientSearch');
  if (searchInput) {
    searchInput.addEventListener('input', renderPatientList);
  }

  // 身份证自动计算年龄性别
  $('#patientIdCard').addEventListener('input', autoFillFromIdCard);

  // ======== AI 口腔检查事件 ========
  $('#btnSaveAiConfig').addEventListener('click', handleAiConfigSave);

  // 图片上传：点击上传区
  $('#aiUploadZone').addEventListener('click', function(e) {
    if (e.target === $('#btnOpenCamera') || e.target.closest('#btnOpenCamera')) return;
    if (e.target === $('#btnRemoveImage') || e.target.closest('#btnRemoveImage')) return;
    if ($('#aiImagePreview').style.display === 'block') return;
    $('#aiImageInput').click();
  });
  $('#aiImageInput').addEventListener('change', function(e) {
    if (e.target.files[0]) handleAiImageUpload(e.target.files[0]);
  });

  // 拍照
  $('#btnOpenCamera').addEventListener('click', function(e) {
    e.stopPropagation();
    $('#aiCameraInput').click();
  });
  $('#aiCameraInput').addEventListener('change', function(e) {
    if (e.target.files[0]) handleAiImageUpload(e.target.files[0]);
  });

  // 拖拽上传
  const uploadZone = $('#aiUploadZone');
  uploadZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('drag-over');
  });
  uploadZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
  });
  uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleAiImageUpload(file);
  });

  // 粘贴图片
  document.addEventListener('paste', function(e) {
    if (STATE.currentPage !== 'aiExam') return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        handleAiImageUpload(item.getAsFile());
        break;
      }
    }
  });

  // 移除图片 / 分析 / 填入 / 复制 / 重分析
  $('#btnRemoveImage').addEventListener('click', function(e) {
    e.stopPropagation();
    removeAiImage();
  });
  $('#btnAnalyzeImage').addEventListener('click', handleAiAnalysis);
  $('#btnFillToRecord').addEventListener('click', fillResultToRecord);
  $('#btnCopyResult').addEventListener('click', copyAiResult);
  $('#btnReanalyze').addEventListener('click', resetAiExam);
  $('#btnRetryAnalysis').addEventListener('click', handleAiAnalysis);
  $('#btnClearAiHistory').addEventListener('click', clearAiHistory);

  // ======== 复诊记录事件 ========
  $('#btnSaveFollowUp').addEventListener('click', saveFollowUp);

  // 点击modal overlay关闭
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('active');
      }
    });
  });

  // 导入文件
  const importZone = $('#importZone');
  const importInput = $('#importFileInput');
  if (importZone && importInput) {
    importZone.addEventListener('click', () => importInput.click());
    importZone.addEventListener('dragover', e => { e.preventDefault(); importZone.style.borderColor = 'var(--primary)'; });
    importZone.addEventListener('dragleave', () => { importZone.style.borderColor = 'var(--gray-300)'; });
    importZone.addEventListener('drop', e => {
      e.preventDefault();
      importZone.style.borderColor = 'var(--gray-300)';
      handleImportFile(e.dataTransfer.files[0]);
    });
    importInput.addEventListener('change', e => {
      if (e.target.files[0]) handleImportFile(e.target.files[0]);
    });
  }

  // 时间更新
  setInterval(updateTime, 1000);
  
  // 渲染
  renderDashboard();
  
  // 尝试自动从GitHub拉取数据（含本地私钥自动加载）
  initGitHubSync();
}

function handleImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.records && Array.isArray(data.records)) {
        const before = STATE.records.length;
        STATE.records = mergeById(STATE.records, data.records);
        if (data.patients && Array.isArray(data.patients)) {
          STATE.patients = mergeById(STATE.patients, data.patients);
        }
        rebuildPatientsFromRecords();
        if (data.consentForms && Array.isArray(data.consentForms)) {
          STATE.consentForms = mergeById(STATE.consentForms, data.consentForms);
        }
        STATE.records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const net = STATE.records.length - before;
        saveLocalData();
        closeModal('importModal');
        renderDashboard();
        renderPatientList();
        showToast('导入成功，合并后共 ' + STATE.records.length + ' 条病例' + (net > 0 ? '（新增 ' + net + ' 条）' : ''), 'success');
      } else {
        showToast('文件格式不正确', 'error');
      }
    } catch (err) {
      showToast('文件解析失败：' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// ==================== 应用入口 ====================
const app = {
  navigateTo,
  viewRecord,
  editRecord,
  deleteRecord,
  printRecord,
  exportRecordJSON,
  showPatientRecords,
  previewConsentForm,
  printConsentForm,
  syncToGitHub,
  pullFromGitHub,
  testGitHubConnection,
  saveGitHubConfig: saveGitHubConfigFromForm,
  exportAllData,
  showImportDialog,
  clearLocalData,
  closeModal,
  setConditionMode,
  // AI 检查
  handleAiAnalysis,
  fillResultToRecord,
  copyAiResult,
  resetAiExam,
  viewAiHistoryItem,
  deleteAiHistoryItem,
  clearAiHistory,
  // 复诊记录
  openFollowUpModal,
  saveFollowUp,
  deleteFollowUp
};

// 启动——始终绑定事件，根据登录状态决定显示哪个页面
document.addEventListener('DOMContentLoaded', () => {
  // 先初始化所有事件绑定
  initApp();
  // 自动登录检查：已登录则进主界面，否则显示登录页
  if (!checkAutoLogin()) {
    // 清除自动登录可能遗留的 appPage 激活状态
    $('#appPage').classList.remove('active');
    $('#loginPage').classList.add('active');
  }
});
